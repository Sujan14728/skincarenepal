'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Marquee from 'react-fast-marquee';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About Us' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' }
];

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);

export default function SiteHeader({
  announcements
}: {
  announcements: string[];
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // The home hero sits under a transparent nav; every other page gets the
  // solid nav plus a spacer.
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className='site-header'>
        {announcements.length > 0 && (
          <div className='site-marquee' role='region' aria-label='Announcements'>
            <Marquee speed={60} gradient={false} pauseOnHover>
              {announcements.map((text, i) => (
                <span key={i}>{text}</span>
              ))}
            </Marquee>
          </div>
        )}
        <div
          className={`site-nav ${scrolled || !isHome || menuOpen ? 'is-scrolled' : ''}`}
        >
          <Link className='logo' href='/' onClick={closeMenu}>
            CARE <span>&amp;</span> CLEAN NEPAL
          </Link>
          <nav
            className={menuOpen ? 'mobile-open' : ''}
            aria-label='Main navigation'
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={
                  isActive(pathname, link.href) ? 'page' : undefined
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className='nav-actions'>
            <Link className='button solid nav-cta' href='/products'>
              Shop Now
            </Link>
            <button
              className='menu-button'
              type='button'
              onClick={() => setMenuOpen(open => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {!isHome && <div className='site-header-spacer' aria-hidden='true' />}
    </>
  );
}
