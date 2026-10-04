import React, { ReactNode } from 'react';
import { Fraunces, Sora } from 'next/font/google';
import { prisma } from '@/lib/prisma';
import { getContactInfo } from '@/lib/storefront';
import SiteHeader from '@/components/storefront/SiteHeader';
import SiteFooter from '@/components/storefront/SiteFooter';
import './styles/site.css';
import './styles/home.css';
import './styles/products.css';
import './styles/reviews.css';
import './styles/contact.css';

// Header announcements and footer contact details come from the database.
export const dynamic = 'force-dynamic';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora',
  display: 'swap'
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap'
});

async function getAnnouncements() {
  try {
    const marquees = await prisma.marquee.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { text: true }
    });
    return marquees.map(m => m.text);
  } catch (error) {
    console.error('Failed to fetch marquees:', error);
    return [];
  }
}

const LandingLayout = async ({ children }: { children: ReactNode }) => {
  const [announcements, contact] = await Promise.all([
    getAnnouncements(),
    getContactInfo()
  ]);

  return (
    <div
      className={`cc-site ${sora.variable} ${fraunces.variable} ${
        announcements.length ? 'has-marquee' : ''
      }`}
    >
      <SiteHeader announcements={announcements} />
      {children}
      <SiteFooter contact={contact} />
    </div>
  );
};

export default LandingLayout;
