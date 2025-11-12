// components/Footer.tsx
import Link from 'next/link';
import {
  LuFacebook,
  LuInstagram,
  LuMail,
  LuMapPin,
  LuPhone
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';

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
        <div className='grid grid-cols-1 gap-12 border-b border-border pb-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8'>
          <div className='space-y-4'>
            <h3 className='text-xl font-bold text-primary-foreground'>
              CARE AND CLEAN NEPAL
            </h3>
            <p className='text-sm text-muted-foreground'>
              Your trusted partner for natural and organic skincare solutions.
              Made with love in Nepal.
            </p>
            <div className='flex space-x-3 pt-2'>
              <a
                href='https://www.facebook.com/careandcleannepal'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:bg-primary/90 rounded-full bg-primary p-2 transition-colors'
                aria-label='Facebook'
              >
                <LuFacebook className='h-5 w-5 text-primary-foreground' />
              </a>
              <a
                href='https://wa.me/9779801753033'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:bg-primary/90 rounded-full bg-primary p-2 transition-colors'
                aria-label='WhatsApp'
              >
                <FaWhatsapp className='h-5 w-5 text-primary-foreground' />
              </a>
              <a
                href='https://www.instagram.com/careandclean_nepal/'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:bg-primary/90 rounded-full bg-primary p-2 transition-colors'
                aria-label='Instagram'
              >
                <LuInstagram className='h-5 w-5 text-primary-foreground' />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-primary-foreground'>
              Quick Links
            </h4>
            <ul className='space-y-2'>
              {quickLinks.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    // Use theme primary for the hover color
                    className='text-sm text-muted-foreground transition-colors hover:text-primary'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-primary-foreground'>
              Customer Service
            </h4>
            <ul className='space-y-2'>
              {customerServiceLinks.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className='text-sm text-muted-foreground transition-colors hover:text-primary'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-primary-foreground'>
              Contact Info
            </h4>
            <ul className='space-y-3'>
              <li className='flex items-start space-x-2'>
                {/* Use theme primary for the icon color */}
                <LuMapPin className='mt-0.5 h-5 w-5 flex-shrink-0 text-primary' />
                <span className='text-sm text-muted-foreground'>
                  Dhangadhi-3, Kailali, Nepal
                </span>
              </li>
              <li className='flex items-start space-x-2'>
                <LuPhone className='mt-0.5 h-5 w-5 flex-shrink-0 text-primary' />
                <a
                  href='tel:+9779801753033'
                  // Use theme primary for the hover color
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  +977 9801753033
                </a>
              </li>
              <li className='flex items-start space-x-2'>
                <LuMail className='mt-0.5 h-5 w-5 flex-shrink-0 text-primary' />
                <a
                  href='mailto:info@skincareneapl.com'
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  info@careandcleannp.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='pt-8 text-center text-sm text-muted-foreground'>
          &copy; {currentYear} **Care and Clean Nepal**. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
export default Footer;
