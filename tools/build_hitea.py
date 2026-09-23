"""
Builds public/models/hi-tea-platter.glb — a true-scale (metres) 3D model of the
Crema Lounge Hi Tea Platter, textured from the reference videos in video/.

    python tools/build_hitea.py

Needs: numpy, opencv-python-headless, pillow, trimesh.
If video/ is absent, the crops already saved in assets/hitea/ are used.

Geometry is built, not scanned: every food item is a heightfield dome over a
superellipse footprint, photo-mapped top-down with a crop from the videos and
lightly displaced by that crop's luminance (crumb, penne, lettuce relief).
Swap in a photogrammetry scan at the same path to upgrade — no code change.
"""

from __future__ import annotations

import io
import json
import math
import os
import struct
from pathlib import Path

import cv2
import numpy as np
import trimesh
from PIL import Image
from trimesh.visual import TextureVisuals
from trimesh.visual.material import PBRMaterial

ROOT = Path(__file__).resolve().parent.parent
VIDEO = ROOT / "video"
CROPS = ROOT / "assets" / "hitea"
OUT = ROOT / "public" / "models" / "hi-tea-platter.glb"

# (video, frame index, x0, y0, x1, y1) in source pixels. Frames are 1080x1920.
BOX = {
    "salad": ("IMG_8148.MOV", 0, 170, 1040, 1050, 1600),
    "croquette1": ("IMG_8148.MOV", 0, 265, 705, 590, 1015),
    "croquette2": ("IMG_8148.MOV", 0, 625, 740, 915, 1025),
    "frosting": ("IMG_8148.MOV", 398, 110, 40, 360, 120),
    "cake": ("IMG_8148.MOV", 398, 110, 168, 460, 330),
    "bun_top": ("IMG_8150.MOV", 1426, 320, 580, 760, 900),
    "bun_side": ("IMG_8148.MOV", 398, 260, 1375, 540, 1440),
    "patty": ("IMG_8148.MOV", 398, 540, 1240, 860, 1370),
    "mayo": ("IMG_8148.MOV", 398, 230, 1200, 420, 1290),
    "bread_top": ("IMG_8150.MOV", 1426, 380, 960, 700, 1060),
    "bread_side": ("IMG_8150.MOV", 1426, 340, 1160, 840, 1330),
    "pasta": ("IMG_8150.MOV", 657, 150, 560, 710, 880),
    "wrap": ("IMG_8150.MOV", 657, 200, 1180, 860, 1550),
    "wing1": ("IMG_8149.MOV", 0, 300, 925, 500, 1165),
    "wing2": ("IMG_8149.MOV", 0, 495, 965, 755, 1235),
    "sauce": ("IMG_8149.MOV", 0, 150, 1080, 600, 1340),
    "tray": ("IMG_8150.MOV", 1426, 40, 1450, 120, 1700),
}
# The tender lies diagonally — lift it as a straightened strip: (p0, p1, width).
TENDER = ("IMG_8150.MOV", 1426, (140, 600), (300, 1760), 120)

RNG = np.random.default_rng(7)


# ---------------------------------------------------------------- textures


def grab_frame(video: str, index: int) -> np.ndarray:
    cap = cv2.VideoCapture(str(VIDEO / video))
    cap.set(cv2.CAP_PROP_POS_FRAMES, index)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise RuntimeError(f"cannot read {video}#{index}")
    return frame


def extract_crops() -> None:
    CROPS.mkdir(parents=True, exist_ok=True)
    frames: dict[tuple[str, int], np.ndarray] = {}

    def frame(v: str, i: int) -> np.ndarray:
        if (v, i) not in frames:
            frames[(v, i)] = grab_frame(v, i)
        return frames[(v, i)]

    for name, (v, i, x0, y0, x1, y1) in BOX.items():
        cv2.imwrite(str(CROPS / f"{name}.jpg"), frame(v, i)[y0:y1, x0:x1], [cv2.IMWRITE_JPEG_QUALITY, 90])

    v, i, p0, p1, width = TENDER
    p0, p1 = np.float32(p0), np.float32(p1)
    length = float(np.linalg.norm(p1 - p0))
    d = (p1 - p0) / length
    n = np.float32([-d[1], d[0]])
    src = np.float32([p0 - n * width / 2, p0 + n * width / 2, p1 - n * width / 2])
    dst = np.float32([[0, 0], [width, 0], [0, length]])
    strip = cv2.warpAffine(frame(v, i), cv2.getAffineTransform(src, dst), (width, int(length)))
    # Lay it lengthways so u runs along the tender.
    cv2.imwrite(str(CROPS / "tender.jpg"), cv2.rotate(strip, cv2.ROTATE_90_CLOCKWISE), [cv2.IMWRITE_JPEG_QUALITY, 90])


def load_rgb(name: str) -> np.ndarray:
    return cv2.cvtColor(cv2.imread(str(CROPS / f"{name}.jpg")), cv2.COLOR_BGR2RGB)


def to_texture(rgb: np.ndarray, max_side: int = 512) -> Image.Image:
    """Resize and re-encode as JPEG so trimesh embeds it without a PNG blow-up."""
    h, w = rgb.shape[:2]
    s = min(1.0, max_side / max(h, w))
    rgb = cv2.resize(rgb, (max(8, int(w * s)), max(8, int(h * s))), interpolation=cv2.INTER_AREA)
    buf = io.BytesIO()
    Image.fromarray(rgb).save(buf, format="JPEG", quality=82)
    buf.seek(0)
    return Image.open(buf)


def luminance(rgb: np.ndarray) -> np.ndarray:
    g = cv2.GaussianBlur(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY), (5, 5), 0).astype(np.float32) / 255
    return g - g.mean()


def speckle_texture(base_rgb: np.ndarray, w: int = 1024, h: int = 448) -> np.ndarray:
    """Grey stoneware with dark flecks, colour sampled from the real tray."""
    base = np.median(base_rgb.reshape(-1, 3), axis=0)
    img = np.ones((h, w, 3), np.float32) * base
    img *= 1 + 0.035 * cv2.GaussianBlur(RNG.standard_normal((h, w)).astype(np.float32), (0, 0), 6)[..., None]
    for _ in range(int(w * h / 900)):
        x, y = RNG.integers(0, w), RNG.integers(0, h)
        r = RNG.choice([1, 1, 1, 2])
        cv2.circle(img, (int(x), int(y)), int(r), tuple(float(c) * 0.25 for c in base), -1, cv2.LINE_AA)
    return np.clip(img, 0, 255).astype(np.uint8)


def bowl_texture(w: int = 512, h: int = 256) -> np.ndarray:
    """Cream stoneware bowl with the brown glazed lip seen in the videos (v=1 is the rim)."""
    cream = np.float32([214, 207, 194])
    brown = np.float32([96, 64, 48])
    v = np.linspace(1, 0, h)[:, None]  # image row 0 = top = v 1
    band = np.clip((v - 0.86) / 0.04, 0, 1)
    img = cream * (1 - band[..., None]) + brown * band[..., None]
    img = np.repeat(img, w, axis=1)
    img *= 1 + 0.03 * cv2.GaussianBlur(RNG.standard_normal((h, w)).astype(np.float32), (0, 0), 3)[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)


def material(tex: Image.Image | None, rough: float, metal: float = 0.0, color=None) -> PBRMaterial:
    return PBRMaterial(
        baseColorTexture=tex,
        baseColorFactor=color if color is not None else [255, 255, 255, 255],
        roughnessFactor=rough,
        metallicFactor=metal,
        doubleSided=False,
    )


# ---------------------------------------------------------------- geometry


def smooth_field(x: np.ndarray, z: np.ndarray, scale: float, k: int = 6) -> np.ndarray:
    """Cheap band-limited noise: a handful of random plane waves, roughly [-1, 1]."""
    out = np.zeros_like(x)
    for _ in range(k):
        ang = RNG.uniform(0, 2 * math.pi)
        freq = 2 * math.pi / (scale * RNG.uniform(0.7, 1.4))
        out += np.sin(freq * (math.cos(ang) * x + math.sin(ang) * z) + RNG.uniform(0, 2 * math.pi))
    return out / math.sqrt(k / 2)


def dome(
    a: float,
    b: float,
    height: float,
    rgb: np.ndarray,
    *,
    n: float = 2.0,
    p: float = 2.0,
    q: float = 0.5,
    rough: float = 0.7,
    disp: float = 0.0,
    bumps: float = 0.0,
    bump_scale: float = 0.03,
    edge_noise: float = 0.0,
    bend: float = 0.0,
    rings: int = 20,
    segs: int = 64,
    t: np.ndarray | None = None,
    profile=None,
    tex_rgb: np.ndarray | None = None,
) -> trimesh.Trimesh:
    """
    Closed dome over a superellipse footprint (semi-axes a along x, b along z).
    Height at normalised radius t is height*(1-t^p)^q unless `profile(t)` is given.
    The photo `rgb` is mapped top-down across the footprint.
    """
    t = np.linspace(0, 1, rings + 1)[1:] if t is None else np.asarray(t)
    th = np.linspace(0, 2 * math.pi, segs, endpoint=False)
    c, s = np.cos(th), np.sin(th)
    radius = (np.abs(c / a) ** n + np.abs(s / b) ** n) ** (-1 / n)
    if edge_noise:
        wob = sum(np.sin(k * th + RNG.uniform(0, 6.3)) / k for k in (2, 3, 5, 7))
        radius = radius * (1 + edge_noise * wob / 1.5)
    T, _ = np.meshgrid(t, th, indexing="ij")
    X = T * radius * c
    Z = T * radius * s
    Y = profile(T) if profile else height * np.clip(1 - T**p, 0, 1) ** q

    U = 0.5 + 0.49 * X / (radius * c).max()
    V = 0.5 - 0.49 * Z / (radius * s).max()
    inner = 1 - np.clip(T, 0, 1) ** 6
    if bumps:
        Y = Y + height * bumps * smooth_field(X, Z, bump_scale) * inner * 0.5
    if disp:
        lum = luminance(rgb)
        h, w = lum.shape
        Y = Y + disp * lum[((1 - V) * (h - 1)).astype(int), (U * (w - 1)).astype(int)] * inner * 2
    Y = np.maximum(Y, 0)
    if bend:
        Z = Z + bend * (X / a) ** 2

    top_c = profile(np.zeros(1))[0] if profile else height
    verts = [[0, top_c, bend * 0], *np.stack([X, Y, Z], -1).reshape(-1, 3)]
    uvs = [[0.5, 0.5], *np.stack([U, V], -1).reshape(-1, 2)]
    R, S = len(t), segs
    idx = lambda r, k: 1 + r * S + (k % S)  # noqa: E731
    faces = [[0, idx(0, k + 1), idx(0, k)] for k in range(S)]
    for r in range(R - 1):
        for k in range(S):
            a0, a1, b0, b1 = idx(r, k), idx(r, k + 1), idx(r + 1, k), idx(r + 1, k + 1)
            faces += [[a0, a1, b1], [a0, b1, b0]]
    # flat underside, separate vertices so the rim edge stays crisp
    base = len(verts)
    verts.append([0, 0, 0])
    uvs.append([0.5, 0.5])
    for k in range(S):
        x, _, z = verts[idx(R - 1, k)]
        verts.append([x, 0, z])
        uvs.append(uvs[idx(R - 1, k)])
    faces += [[base, base + 1 + k, base + 1 + (k + 1) % S] for k in range(S)]

    mesh = trimesh.Trimesh(np.array(verts, np.float32), np.array(faces), process=False)
    if mesh.face_normals[0][1] < 0:  # winding sanity: the top must face up
        mesh.invert()
    mesh.visual = TextureVisuals(uv=np.array(uvs, np.float32), material=material(to_texture(tex_rgb if tex_rgb is not None else rgb), rough))
    return mesh


def lathe(profile: list[tuple[float, float]], rgb: np.ndarray, *, segs: int = 72, u_repeat: float = 1.0, rough: float = 0.6) -> trimesh.Trimesh:
    """Surface of revolution around +y. Profile is (radius, y) pairs; v follows arc length."""
    pts = np.array(profile, np.float32)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    v = np.concatenate([[0], np.cumsum(seg)]) / seg.sum()
    th = np.linspace(0, 2 * math.pi, segs + 1)  # duplicated seam column for the u wrap
    verts, uvs = [], []
    for j, (r, y) in enumerate(pts):
        for k, a in enumerate(th):
            verts.append([r * math.cos(a), y, r * math.sin(a)])
            uvs.append([u_repeat * k / segs, v[j]])
    faces = []
    W = segs + 1
    for j in range(len(pts) - 1):
        for k in range(segs):
            a0, a1, b0, b1 = j * W + k, j * W + k + 1, (j + 1) * W + k, (j + 1) * W + k + 1
            faces += [[a0, b1, a1], [a0, b0, b1]]
    mesh = trimesh.Trimesh(np.array(verts, np.float32), np.array(faces), process=False)
    mesh.visual = TextureVisuals(uv=np.array(uvs, np.float32), material=material(to_texture(rgb), rough))
    return mesh


def prism(outline: list[np.ndarray], y0: float, y1: float, rgb: np.ndarray, *, rough: float = 0.8, u_scale: float = 1.0) -> trimesh.Trimesh:
    """Vertical walls around a closed convex (x, z) outline, the photo wrapped once around it."""
    centre = np.mean(outline, axis=0)
    loop = [*outline, outline[0]]
    lengths = [float(np.linalg.norm(loop[i + 1] - loop[i])) for i in range(len(outline))]
    total = sum(lengths)
    verts, uvs, faces, run = [], [], [], 0.0
    for i, l in enumerate(lengths):
        (x0, z0), (x1, z1) = loop[i], loop[i + 1]
        u0, u1 = u_scale * run / total, u_scale * (run + l) / total
        run += l
        k = len(verts)
        verts += [[x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0]]
        uvs += [[u0, 0.02], [u1, 0.02], [u1, 0.98], [u0, 0.98]]
        faces += [[k, k + 1, k + 2], [k, k + 2, k + 3]]
    mesh = trimesh.Trimesh(np.array(verts, np.float32), np.array(faces), process=False)
    # wind every quad so its normal points away from the centre
    for f in range(0, len(faces), 2):
        mid = mesh.vertices[mesh.faces[f]].mean(0)
        if np.dot(mesh.face_normals[f][[0, 2]], mid[[0, 2]] - centre) < 0:
            mesh.faces[f] = mesh.faces[f][::-1]
            mesh.faces[f + 1] = mesh.faces[f + 1][::-1]
    mesh = trimesh.Trimesh(mesh.vertices, mesh.faces, process=False)
    mesh.visual = TextureVisuals(uv=np.array(uvs, np.float32), material=material(to_texture(rgb), rough))
    return mesh


def cap(outline: list[np.ndarray], y: float, rgb: np.ndarray, *, rough: float = 0.8) -> trimesh.Trimesh:
    """Flat top over a convex outline, the photo mapped across its bounding box."""
    pts = np.array(outline)
    lo, hi = pts.min(0), pts.max(0)
    centre = pts.mean(0)
    verts = [[centre[0], y, centre[1]], *[[x, y, z] for x, z in pts]]
    uv = [[0.02 + 0.96 * (x - lo[0]) / (hi[0] - lo[0]), 0.98 - 0.96 * (z - lo[1]) / (hi[1] - lo[1])] for x, _, z in verts]
    faces = [[0, 1 + (i + 1) % len(pts), 1 + i] for i in range(len(pts))]
    mesh = trimesh.Trimesh(np.array(verts, np.float32), np.array(faces), process=False)
    if mesh.face_normals[0][1] < 0:
        mesh.invert()
    mesh.visual = TextureVisuals(uv=np.array(uv, np.float32), material=material(to_texture(rgb), rough))
    return mesh


def cake_wedge(body: np.ndarray, frosting: np.ndarray, *, radius=0.1, half_angle=math.radians(19), height=0.056, cream=0.012) -> list[trimesh.Trimesh]:
    """Carrot-cake slice: apex at the origin, arc at +x, a cream-cheese layer piped into ridges on top."""
    arc = np.linspace(-half_angle, half_angle, 14)
    outline = [np.array([0.0, 0.0])] + [np.array([radius * math.cos(a), radius * math.sin(a)]) for a in arc]
    walls = prism(outline, 0, height, body, u_scale=2.2)
    cream_walls = prism(outline, height, height + cream, frosting, rough=0.55, u_scale=3)

    # piped ridges run across the slice, like the bag lines in the videos
    rs = np.linspace(0.0, radius, 44)
    ph = np.linspace(-half_angle, half_angle, 18)
    Rr, Pp = np.meshgrid(rs, ph, indexing="ij")
    X, Z = Rr * np.cos(Pp), Rr * np.sin(Pp)
    edge = np.clip(np.minimum((half_angle - np.abs(Pp)) * np.maximum(Rr, 1e-4) / 0.005, (radius - Rr) / 0.005), 0, 1)
    ridge = 0.5 + 0.5 * np.cos(2 * math.pi * Rr / 0.016)
    Y = height + cream + 0.007 * ridge * edge**0.7
    fv = np.stack([X, Y, Z], -1).reshape(-1, 3)
    fu = np.stack([0.02 + 0.96 * Rr / radius, 0.5 + 0.48 * Z / (radius * math.sin(half_angle))], -1).reshape(-1, 2)
    W = len(ph)
    ff = []
    for i in range(len(rs) - 1):
        for j in range(W - 1):
            a0, a1, b0, b1 = i * W + j, i * W + j + 1, (i + 1) * W + j, (i + 1) * W + j + 1
            ff += [[a0, a1, b1], [a0, b1, b0]]
    top = trimesh.Trimesh(fv.astype(np.float32), np.array(ff), process=False)
    if top.face_normals[len(ff) // 2][1] < 0:
        top.invert()
    top.visual = TextureVisuals(uv=fu.astype(np.float32), material=material(to_texture(frosting), 0.55))
    return [walls, cream_walls, top]


def finger_sandwich(side: np.ndarray, top: np.ndarray, *, length=0.07, depth=0.028, height=0.042) -> list[trimesh.Trimesh]:
    """Crustless white-bread finger with the filling line showing on its cut faces."""
    a, b = length / 2, depth / 2
    outline = [np.array(p) for p in ((-a, -b), (a, -b), (a, b), (-a, b))]
    return [prism(outline, 0, height, side, rough=0.9, u_scale=2), cap(outline, height, top, rough=0.9)]


def rod(p0, p1, r=0.0028) -> trimesh.Trimesh:
    return trimesh.creation.cylinder(radius=r, segment=[p0, p1], sections=10)


def place(mesh: trimesh.Trimesh, x=0.0, y=0.0, z=0.0, yaw_deg=0.0) -> trimesh.Trimesh:
    m = mesh.copy()
    if yaw_deg:
        m.apply_transform(trimesh.transformations.rotation_matrix(math.radians(yaw_deg), [0, 1, 0]))
    m.apply_translation([x, y, z])
    return m


# ---------------------------------------------------------------- assembly

TRAY_A, TRAY_B, TRAY_T = 0.15, 0.066, 0.012  # 30 x 13.2 cm stoneware platter
TIERS = [(0.045, 0.085), (0.14, 0.0), (0.235, -0.085)]  # (underside height, depth) front -> back
POST_X, SUPPORT_Z = 0.128, 0.05


def tray(tex_rgb: np.ndarray) -> trimesh.Trimesh:
    def profile(T):
        lip = np.where(T > 0.9, 0.003 * np.sin(np.clip((T - 0.9) / 0.085, 0, 1) * math.pi * 0.75), 0)
        drop = np.clip((T - 0.985) / 0.015, 0, 1)
        return (TRAY_T + lip) * (1 - drop) ** 0.4 * (1 - drop * 0.35)

    t = np.concatenate([np.linspace(0.12, 0.88, 6), np.linspace(0.9, 0.98, 10), np.linspace(0.985, 1, 5)])
    return dome(TRAY_A, TRAY_B, TRAY_T, tex_rgb, n=14, t=t, profile=profile, rough=0.45, segs=120)


def stand() -> trimesh.Trimesh:
    parts = []
    front, back = TIERS[0][1] + 0.07, TIERS[-1][1] - 0.07
    for sx in (-POST_X, POST_X):
        parts.append(rod([sx, 0.004, front], [sx, 0.004, back], 0.0032))
        for zz in (front, back):
            parts.append(trimesh.creation.icosphere(2, 0.0055).apply_translation([sx, 0.005, zz]))
    for y, z in TIERS:
        ys = y - 0.003
        for sx in (-POST_X, POST_X):
            for zz in (z - SUPPORT_Z, z + SUPPORT_Z):
                parts.append(rod([sx, 0.004, zz], [sx, ys, zz]))
            parts.append(rod([sx, ys, z - SUPPORT_Z], [sx, ys, z + SUPPORT_Z]))
        for zz in (z - SUPPORT_Z, z + SUPPORT_Z):
            parts.append(rod([-POST_X, ys, zz], [POST_X, ys, zz]))
    for zz in (front - 0.02, back + 0.02):
        parts.append(rod([-POST_X, 0.004, zz], [POST_X, 0.004, zz], 0.0026))
    metal = trimesh.util.concatenate(parts)
    metal.visual = TextureVisuals(uv=np.zeros((len(metal.vertices), 2), np.float32), material=material(None, 0.38, 0.75, [14, 14, 14, 255]))
    return metal


def burger(tex: dict) -> list[trimesh.Trimesh]:
    rb = 0.041
    bottom = lathe([(0, 0), (rb - 0.006, 0), (rb - 0.001, 0.004), (rb + 0.001, 0.012), (rb - 0.001, 0.019), (0, 0.02)], tex["bun_side"], u_repeat=3, rough=0.75)
    patty = lathe([(0, 0.019), (rb + 0.002, 0.019), (rb + 0.005, 0.023), (rb + 0.003, 0.028), (0, 0.028)], tex["patty"], u_repeat=4, rough=0.8)
    mayo = lathe([(0, 0.0275), (rb + 0.001, 0.0275), (rb + 0.0025, 0.0295), (rb, 0.031), (0, 0.031)], tex["mayo"], u_repeat=3, rough=0.35)
    top = place(dome(rb, rb, 0.028, tex["bun_top"], p=2.4, q=0.45, disp=0.0012, rings=22, segs=72), y=0.0305)
    return [bottom, patty, mayo, top]


def jpeg_textures(glb: bytes, quality: int = 80) -> bytes:
    """trimesh drops the JPEG flag on material images and embeds PNGs (~4x larger); re-encode them."""
    json_len = struct.unpack("<I", glb[12:16])[0]
    tree = json.loads(glb[20 : 20 + json_len])
    bin_start = 20 + json_len + 8
    blob = glb[bin_start : bin_start + struct.unpack("<I", glb[20 + json_len : 24 + json_len])[0]]
    views = tree["bufferViews"]
    swapped = {}
    for image in tree.get("images", []):
        view = views[image["bufferView"]]
        raw = blob[view.get("byteOffset", 0) : view.get("byteOffset", 0) + view["byteLength"]]
        buf = io.BytesIO()
        Image.open(io.BytesIO(raw)).convert("RGB").save(buf, format="JPEG", quality=quality, optimize=True)
        swapped[image["bufferView"]] = buf.getvalue()
        image["mimeType"] = "image/jpeg"
    out = bytearray()
    for i, view in enumerate(views):
        data = swapped.get(i) or blob[view.get("byteOffset", 0) : view.get("byteOffset", 0) + view["byteLength"]]
        out += b"\0" * (-len(out) % 4)
        view["byteOffset"], view["byteLength"] = len(out), len(data)
        out += data
    out += b"\0" * (-len(out) % 4)
    tree["buffers"] = [{"byteLength": len(out)}]
    js = json.dumps(tree, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    total = 12 + 8 + len(js) + 8 + len(out)
    return (
        struct.pack("<III", 0x46546C67, 2, total)
        + struct.pack("<I4s", len(js), b"JSON") + js
        + struct.pack("<I4s", len(out), b"BIN\0") + bytes(out)
    )


def build() -> None:
    if VIDEO.exists():
        extract_crops()
    names = [*BOX.keys(), "tender"]
    tex = {k: load_rgb(k) for k in names}
    tex["tray_speckle"] = speckle_texture(tex["tray"])

    parts: list[trimesh.Trimesh] = [stand()]
    tops = []
    for y, z in TIERS:
        parts.append(place(tray(tex["tray_speckle"]), 0, y, z))
        tops.append((y + TRAY_T, z))

    # bottom tier: creamy dip, two wings, penne arrabbiata bowl, grilled wrap
    y, z = tops[0]
    parts.append(place(dome(0.05, 0.042, 0.007, tex["sauce"], n=2.4, p=4, q=0.3, edge_noise=0.12, rough=0.28, disp=0.0008), -0.095, y, z + 0.012))
    parts.append(place(dome(0.033, 0.019, 0.02, tex["wing1"], p=2.4, q=0.5, bumps=0.12, bump_scale=0.02, disp=0.0012, rough=0.55), -0.098, y + 0.003, z - 0.028, 12))
    parts.append(place(dome(0.033, 0.02, 0.021, tex["wing2"], p=2.4, q=0.5, bumps=0.12, bump_scale=0.02, disp=0.0012, rough=0.55), -0.066, y + 0.003, z - 0.006, -22))
    bowl = lathe(
        [(0.0, 0.0), (0.043, 0.0), (0.047, 0.004), (0.052, 0.05), (0.052, 0.053), (0.049, 0.0545), (0.0465, 0.05), (0.042, 0.011), (0.0, 0.011)],
        bowl_texture(),
        rough=0.4,
    )
    parts.append(place(bowl, 0.012, y, z))
    parts.append(place(dome(0.046, 0.046, 0.016, tex["pasta"], p=1.7, q=0.5, disp=0.006, bumps=0.2, bump_scale=0.025, rough=0.32), 0.012, y + 0.036, z))
    parts.append(place(dome(0.036, 0.054, 0.03, tex["wrap"], n=5, p=3, q=0.42, disp=0.0015, bumps=0.08, rough=0.7), 0.106, y, z, 4))

    # middle tier: two chicken sliders, crumbed tender, finger sandwiches
    y, z = tops[1]
    for x, yaw in ((-0.098, 0), (0.104, 30)):
        parts += [place(m, x, y, z + 0.004, yaw) for m in burger(tex)]
    parts.append(place(dome(0.068, 0.017, 0.02, tex["tender"], n=2.2, p=2.2, q=0.6, bend=0.008, disp=0.002, bumps=0.15, bump_scale=0.03, rough=0.6), -0.018, y, z + 0.022, 24))
    for x, zz, yaw in ((0.03, -0.042, 4), (0.038, -0.011, -6)):
        parts += [place(m, x, y, z + zz, yaw) for m in finger_sandwich(tex["bread_side"], tex["bread_top"])]

    # top tier: garden salad, two croquettes, carrot cake
    y, z = tops[2]
    parts.append(place(dome(0.058, 0.057, 0.036, tex["salad"], n=2.4, p=1.8, q=0.7, bumps=0.12, bump_scale=0.04, edge_noise=0.1, disp=0.002, rings=36, segs=110, rough=0.5), -0.088, y, z))
    parts.append(place(dome(0.03, 0.03, 0.02, tex["croquette1"], p=2.0, q=0.6, disp=0.001, bumps=0.06, rough=0.75), -0.004, y, z - 0.031))
    parts.append(place(dome(0.03, 0.03, 0.02, tex["croquette2"], p=2.0, q=0.6, disp=0.001, bumps=0.06, rough=0.75), 0.006, y, z + 0.031))
    parts += [place(m, 0.042, y, z) for m in cake_wedge(tex["cake"], tex["frosting"])]

    scene = trimesh.Scene()
    for i, m in enumerate(parts):
        scene.add_geometry(m, node_name=f"part_{i}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(jpeg_textures(scene.export(file_type="glb")))
    lo, hi = scene.bounds
    print(f"wrote {OUT.relative_to(ROOT)}  {OUT.stat().st_size / 1024:.0f} KB  size(m)={np.round(hi - lo, 3)}  tris={sum(len(m.faces) for m in parts)}")


if __name__ == "__main__":
    os.chdir(ROOT)
    build()
