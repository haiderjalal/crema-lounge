"""
Builds true-scale GLB models of plated dishes from a short overhead video.

    python tools/build_plates.py

For each dish in DISHES:
  1. take the first (overhead) frame of video/<name>.MOV,
  2. find the plate's brown rim, and warp that ellipse to a circle — a true
     top-down photo of the plate, saved to assets/<slug>/top.jpg,
  3. model the plate (cream stoneware, brown lip) as a lathe,
  4. raise the food as a heightfield over the plate floor: each traced food
     zone becomes a mound that follows the food's real outline, with the
     photo's own fine detail (fries, ribbons, sauce) pressed in as relief.

The rectified photo is the texture, so every fry and parsley fleck is the
real one. If video/ is absent, the saved top.jpg is used.
"""

from __future__ import annotations

import math
import os
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np
import trimesh
from trimesh.visual import TextureVisuals

from build_hitea import compress, export_glb, lathe, material, to_texture

ROOT = Path(__file__).resolve().parent.parent
VIDEO = ROOT / "video"

PX, RIM_PX = 1024, 490  # rectified image size; rim radius in it
RIM = 0.135  # outer rim radius, m — a 27 cm coupe plate
FLOOR_R, FLOOR_Y = 0.1305, 0.008  # food surface starts at the plate floor
GRID = 190  # heightfield resolution across the plate (~1.4 mm)


@dataclass(frozen=True)
class Zone:
    """A traced food area in rectified-photo pixels."""

    outline: tuple[tuple[int, int], ...]
    height: float  # m above the plate floor at the zone's thickest point
    ramp: float  # m from the edge to full height — small = steep sides
    relief: float  # m of photo-detail relief (fries, ribbons)
    by_colour: bool = True  # refine the outline by colour; off where food matches the plate


@dataclass(frozen=True)
class Dish:
    video: str
    slug: str
    frame: int
    plate_samples: tuple[tuple[int, int], ...]  # bare-plate pixels for the colour key
    zones: tuple[Zone, ...]


DISHES = (
    Dish(
        video="Chicken Supreme.MOV",
        slug="chicken-supreme",
        frame=0,
        plate_samples=((640, 600), (560, 110), (150, 700)),
        zones=(
            # crumbed chicken under the creamy mushroom sauce — sauce matches the plate, so outline only
            Zone(((60, 330), (90, 240), (170, 170), (250, 110), (330, 90), (450, 110), (540, 170), (600, 250), (630, 330), (700, 400), (690, 450),
                  (620, 450), (600, 520), (570, 600), (540, 660), (470, 690), (380, 680), (300, 690), (230, 670), (190, 620), (120, 560), (60, 530), (40, 440)),
                 height=0.022, ramp=0.022, relief=0.0012, by_colour=False),
            # fries
            Zone(((640, 270), (700, 250), (760, 180), (830, 160), (900, 230), (960, 330), (990, 450), (1000, 580), (960, 650), (900, 760), (850, 790),
                  (760, 740), (700, 660), (690, 560), (660, 450), (640, 370)),
                 height=0.027, ramp=0.02, relief=0.005),
            # sautéed carrots, beans and courgette
            Zone(((220, 740), (270, 700), (360, 680), (520, 660), (640, 650), (720, 660), (800, 760), (780, 850), (700, 900), (560, 960), (420, 980),
                  (260, 930), (210, 860)),
                 height=0.014, ramp=0.008, relief=0.004),
        ),
    ),
    Dish(
        video="Eggplant Parmigiana.MOV",
        slug="eggplant-parmigiana",
        frame=0,
        plate_samples=((500, 860), (200, 780), (700, 120)),
        zones=(
            # fettuccine in pink sauce
            Zone(((40, 380), (80, 260), (150, 210), (260, 210), (330, 240), (330, 470), (340, 640), (290, 700), (250, 770), (200, 720), (100, 710),
                  (60, 640), (40, 520)),
                 height=0.034, ramp=0.024, relief=0.005),
            # breaded cutlet under baked mozzarella, eggplant and capsicum
            Zone(((280, 440), (320, 280), (360, 200), (520, 185), (760, 190), (860, 250), (900, 330), (940, 450), (960, 600), (900, 660), (760, 700),
                  (700, 770), (560, 770), (450, 740), (380, 700), (300, 620), (290, 540)),
                 height=0.019, ramp=0.012, relief=0.002),
        ),
    ),
)


# ---------------------------------------------------------------- photo


def rectify(frame: np.ndarray) -> np.ndarray:
    """Warp the plate's rim ellipse to a centred circle of radius RIM_PX."""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    table = (hsv[..., 1] < 22) & (hsv[..., 2] > 150)  # white marble
    blob = cv2.morphologyEx((~table).astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    blob = cv2.morphologyEx(blob, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    outer = cv2.fitEllipse(max(cv2.findContours(blob, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], key=cv2.contourArea))
    band = np.zeros(blob.shape, np.uint8)
    cv2.ellipse(band, outer, 255, 70)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    rim = (band > 0) & ((h < 18) | (h > 170)) & (s > 55) & (v > 60) & (v < 200)  # the brown glazed lip
    ys, xs = np.nonzero(rim)
    (cx, cy), (w, hh), ang = cv2.fitEllipse(np.stack([xs, ys], 1).astype(np.float32))
    a = math.radians(ang)
    rot = np.array([[math.cos(a), math.sin(a)], [-math.sin(a), math.cos(a)]])
    m = rot.T @ np.diag([2 * RIM_PX / w, 2 * RIM_PX / hh]) @ rot
    t = np.array([PX / 2, PX / 2]) - m @ np.array([cx, cy])
    return cv2.warpAffine(frame, np.hstack([m, t[:, None]]), (PX, PX), flags=cv2.INTER_CUBIC, borderValue=(255, 255, 255))


def top_photo(dish: Dish) -> np.ndarray:
    path = ROOT / "assets" / dish.slug / "top.jpg"
    if (VIDEO / dish.video).exists():
        cap = cv2.VideoCapture(str(VIDEO / dish.video))
        cap.set(cv2.CAP_PROP_POS_FRAMES, dish.frame)
        ok, frame = cap.read()
        cap.release()
        if not ok:
            raise RuntimeError(f"cannot read {dish.video}")
        path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(path), rectify(frame), [cv2.IMWRITE_JPEG_QUALITY, 92])
    return cv2.imread(str(path))


def height_map(photo: np.ndarray, dish: Dish) -> np.ndarray:
    """Metres above the plate floor for every rectified pixel."""
    metres_per_px = RIM / RIM_PX
    lab = cv2.cvtColor(cv2.GaussianBlur(photo, (7, 7), 0), cv2.COLOR_BGR2LAB).astype(np.float32)
    ref = np.median(np.concatenate([lab[y - 12 : y + 12, x - 12 : x + 12].reshape(-1, 3) for x, y in dish.plate_samples]), 0)
    d = lab - ref
    food_colour = np.sqrt(0.35 * d[..., 0] ** 2 + d[..., 1] ** 2 + d[..., 2] ** 2) > 14

    grey = cv2.cvtColor(photo, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    detail = grey - cv2.GaussianBlur(grey, (0, 0), 5)  # fine light/dark = ridges and gaps

    out = np.zeros(grey.shape, np.float32)
    for zone in dish.zones:
        mask = np.zeros(grey.shape, np.uint8)
        cv2.fillPoly(mask, [np.array(zone.outline, np.int32)], 1)
        if zone.by_colour:
            mask &= food_colour.astype(np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        inside = cv2.distanceTransform(mask, cv2.DIST_L2, 5) * metres_per_px
        body = zone.height * np.clip(inside / zone.ramp, 0, 1) ** 0.55
        soft = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 2)
        out = np.maximum(out, body + zone.relief * detail * 6 * soft)
    return cv2.GaussianBlur(np.maximum(out, 0), (0, 0), 1.2)


# ---------------------------------------------------------------- geometry


def food_surface(photo: np.ndarray, heights: np.ndarray) -> trimesh.Trimesh:
    """Square-grid heightfield clipped to the plate floor, photo-mapped top-down."""
    xs = np.linspace(-FLOOR_R, FLOOR_R, GRID)
    X, Z = np.meshgrid(xs, xs)
    px = PX / 2 + X / RIM * RIM_PX
    pz = PX / 2 + Z / RIM * RIM_PX  # +z (toward the viewer) is the bottom of the photo
    Y = FLOOR_Y + heights[np.clip(pz, 0, PX - 1).astype(int), np.clip(px, 0, PX - 1).astype(int)]
    verts = np.stack([X, Y, Z], -1).reshape(-1, 3)
    uvs = np.stack([px / PX, 1 - pz / PX], -1).reshape(-1, 2)
    inside = (X**2 + Z**2) <= (FLOOR_R + 0.0015) ** 2
    faces = []
    for i in range(GRID - 1):
        for j in range(GRID - 1):
            if inside[i, j] and inside[i, j + 1] and inside[i + 1, j] and inside[i + 1, j + 1]:
                a, b, c, d = i * GRID + j, i * GRID + j + 1, (i + 1) * GRID + j, (i + 1) * GRID + j + 1
                faces += [[a, c, b], [b, c, d]]
    mesh = trimesh.Trimesh(verts.astype(np.float32), np.array(faces), process=False)
    if mesh.face_normals[len(faces) // 2][1] < 0:
        mesh.invert()
    used = np.unique(mesh.faces)  # drop grid points outside the circle
    remap = np.full(len(verts), -1)
    remap[used] = np.arange(len(used))
    mesh = trimesh.Trimesh(mesh.vertices[used], remap[mesh.faces], process=False)
    rgb = cv2.cvtColor(photo, cv2.COLOR_BGR2RGB)
    mesh.visual = TextureVisuals(uv=uvs[used].astype(np.float32), material=material(to_texture(rgb, 1024), 0.55))
    return mesh


def plate(photo: np.ndarray, dish: Dish) -> trimesh.Trimesh:
    """Coupe plate with a low straight wall and a brown glazed lip, colours sampled from the photo."""
    rgb = cv2.cvtColor(photo, cv2.COLOR_BGR2RGB)
    cream = np.median(np.concatenate([rgb[y - 12 : y + 12, x - 12 : x + 12].reshape(-1, 3) for x, y in dish.plate_samples]), 0)
    yy, xx = np.mgrid[0:PX, 0:PX]
    ring = np.abs(np.hypot(xx - PX / 2, yy - PX / 2) - (RIM_PX - 3)) < 3
    brown = np.median(rgb[ring & (yy < PX / 2)], 0)  # far side of the lip, no wall in view

    profile = [
        (0.0, 0.0), (0.112, 0.0), (0.118, 0.003), (0.131, 0.006), (0.1345, 0.012), (0.135, 0.0205),  # foot + outer wall
        (0.1345, 0.0225), (0.132, 0.0228), (0.1305, 0.0205), (0.1302, 0.012), (0.1298, FLOOR_Y + 0.0006),  # lip + inner wall
    ]
    pts = np.array(profile)
    arc = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    v = arc / arc[-1]
    lip0, lip1 = v[5] - 0.012, v[8]  # brown from just below the outer edge to the top of the inner wall
    rows = 256
    vv = np.linspace(1, 0, rows)[:, None]  # image row 0 is v = 1
    band = ((vv >= lip0) & (vv <= lip1)).astype(np.float32)
    band = cv2.GaussianBlur(band, (1, 5), 0)
    tex = cream * (1 - band[..., None]) + brown * band[..., None]
    tex = np.repeat(tex, 64, axis=1)
    return lathe(profile, np.clip(tex, 0, 255).astype(np.uint8), segs=128, rough=0.35)


def build(dish: Dish) -> None:
    photo = top_photo(dish)
    scene = trimesh.Scene()
    scene.add_geometry(plate(photo, dish), node_name="plate")
    scene.add_geometry(food_surface(photo, height_map(photo, dish)), node_name="food")
    out = ROOT / "public" / "models" / f"{dish.slug}.glb"
    out.write_bytes(export_glb(scene))
    compress(out)
    lo, hi = scene.bounds
    tris = sum(len(g.faces) for g in scene.geometry.values())
    print(f"wrote {out.relative_to(ROOT)}  {out.stat().st_size / 1024:.0f} KB  size(m)={np.round(hi - lo, 3)}  tris={tris}")


if __name__ == "__main__":
    os.chdir(ROOT)
    for dish in DISHES:
        build(dish)
