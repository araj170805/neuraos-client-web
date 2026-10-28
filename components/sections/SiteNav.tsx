import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { LogoMark } from "@/components/ui/LogoMark";
import { Text } from "@/components/ui/Text";
import { brandName, launchCtas, navLinks, sectionIds, webAppHref } from "@/lib/content";

/**
 * Fixed top bar: brand, section anchors (from `sm` up) and the app CTA.
 * `data-nav-item`s fade out one by one as the footer arrives (ScrollEffects).
 */
export function SiteNav() {
  return (
    <Container
      as="header"
      data-site-nav
      className="fixed inset-x-0 top-0 z-10 flex h-nav items-center justify-between bg-linear-to-b from-paper to-paper/0"
    >
      <Text
        as="a"
        href={`#${sectionIds.top}`}
        variant="brand"
        data-nav-item
        className="flex items-center gap-2.5 transition-colors duration-(--duration-hover) hover:text-accent"
      >
        <LogoMark className="size-7 text-ink" />
        {brandName}
      </Text>

      <nav aria-label="Main" className="flex items-center gap-7">
        <ul className="hidden items-center gap-7 sm:flex">
          {navLinks.map((link) => (
            <li key={link.href} data-nav-item>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <ButtonLink href={webAppHref} look="dark-sm" data-nav-item>
          {launchCtas.nav.label}
        </ButtonLink>
      </nav>
    </Container>
  );
}
