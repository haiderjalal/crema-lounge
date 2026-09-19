import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { site } from "@/data/site";

const footerLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/#story", label: "The Room" },
  { href: "/#events", label: "Events" },
  { href: "/#visit", label: "Visit" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-cream-200/10 bg-forest-900">
      <div className="u-container py-16">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo size={52} />
            <p className="mt-6 font-display text-xl leading-snug text-cream-100 italic">
              {site.tagline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-cream-200/50">
              {site.address.line1}, {site.address.line2}
              <br />
              {site.address.city}, {site.address.country}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-14 gap-y-3.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-200/60 transition-colors hover:text-gold-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream-200/60 transition-colors hover:text-gold-300"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={site.orderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream-200/60 transition-colors hover:text-gold-300"
                >
                  Order Online
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="u-rule mt-14" />

        <div className="mt-8 flex flex-col gap-3 text-xs text-cream-200/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p className="tracking-[0.18em] uppercase">
            F-7 Markaz · Islamabad
          </p>
        </div>
      </div>
    </footer>
  );
}
