// components/Footer.tsx
import Link from 'next/link';
import {
  LuFacebook,
  LuInstagram,
  LuLinkedin,
  LuMail,
  LuMapPin,
  LuPhone
} from 'react-icons/lu';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About Us' },
  { href: '/careers', label: 'Careers' }
];

const customerServiceLinks = [
  { href: '/shipping', label: 'Shipping & Delivery' },
  { href: '/returns', label: 'Returns & Exchanges' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' }
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-foreground text-foreground'>
      <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='border-border grid grid-cols-1 gap-12 border-b pb-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8'>
          <div className='space-y-4'>
            <h3 className='text-primary-foreground text-xl font-bold'>
              Skin Care Nepal
            </h3>
            <p className='text-muted-foreground text-sm'>
              Your trusted partner for natural and organic skincare solutions.
              Made with love in Nepal.
            </p>
            <div className='flex space-x-3 pt-2'>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-primary hover:bg-primary/90 rounded-full p-2 transition-colors'
                aria-label='Facebook'
              >
                <LuFacebook className='text-primary-foreground h-5 w-5' />
              </a>
              <a
                href='https://linkedin.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-primary hover:bg-primary/90 rounded-full p-2 transition-colors'
                aria-label='LinkedIn'
              >
                <LuLinkedin className='text-primary-foreground h-5 w-5' />
              </a>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-primary hover:bg-primary/90 rounded-full p-2 transition-colors'
                aria-label='Instagram'
              >
                <LuInstagram className='text-primary-foreground h-5 w-5' />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className='space-y-4'>
            <h4 className='text-primary-foreground text-lg font-semibold'>
              Quick Links
            </h4>
            <ul className='space-y-2'>
              {quickLinks.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    // Use theme primary for the hover color
                    className='hover:text-primary text-muted-foreground text-sm transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className='space-y-4'>
            <h4 className='text-primary-foreground text-lg font-semibold'>
              Customer Service
            </h4>
            <ul className='space-y-2'>
              {customerServiceLinks.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className='hover:text-primary text-muted-foreground text-sm transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className='space-y-4'>
            <h4 className='text-primary-foreground text-lg font-semibold'>
              Contact Info
            </h4>
            <ul className='space-y-3'>
              <li className='flex items-start space-x-2'>
                {/* Use theme primary for the icon color */}
                <LuMapPin className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
                <span className='text-muted-foreground text-sm'>
                  Thamel, Kathmandu, Nepal
                </span>
              </li>
              <li className='flex items-start space-x-2'>
                <LuPhone className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
                <a
                  href='tel:+977014567890'
                  // Use theme primary for the hover color
                  className='hover:text-primary text-muted-foreground text-sm transition-colors'
                >
                  +977 01-4567890
                </a>
              </li>
              <li className='flex items-start space-x-2'>
                <LuMail className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />
                <a
                  href='mailto:info@skincareneapl.com'
                  className='hover:text-primary text-muted-foreground text-sm transition-colors'
                >
                  info@skincareneapl.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='text-muted-foreground pt-8 text-center text-sm'>
          &copy; {currentYear} **Skin Care Nepal**. All rights reserved. Made
          with <span className='text-destructive-foreground'>❤️</span> in Nepal
        </div>
      </div>
    </footer>
  );
};
export default Footer;
