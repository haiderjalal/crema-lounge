import Image from "next/image";

export interface LogoProps {
  readonly size?: number;
  readonly className?: string;
  readonly priority?: boolean;
}

/**
 * The venue's actual logo mark. The source artwork is a circular mark on a
 * solid forest ground, so it is clipped to a circle and scaled just past the
 * frame — the square edge disappears on any background.
 */
export function Logo({ size = 44, className, priority = false }: LogoProps) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/logo.jpg"
        alt="Crema Lounge"
        width={320}
        height={320}
        priority={priority}
        className="h-full w-full scale-[1.04] object-cover"
      />
    </span>
  );
}
