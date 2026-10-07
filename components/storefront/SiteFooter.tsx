import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { SOCIAL_LINKS, type ContactInfo } from '@/lib/storefront-utils';

export default function SiteFooter({ contact }: { contact: ContactInfo }) {
  return (
    <footer className='site-footer'>
      <div className='footer-grid'>
        <div>
          <Image
            className='footer-logo'
            src='/images/logo.png'
            alt='Care and Clean Nepal'
            width={207}
            height={48}
            style={{ height: 48, width: 'auto' }}
          />
          <p>Everyday care for your skincare routine.</p>
          <div className='socials'>
            <a
              href={SOCIAL_LINKS.instagram}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Instagram'
            >
              <Instagram />
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Facebook'
            >
              <Facebook />
            </a>
            <a
              href={SOCIAL_LINKS.tiktok}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='TikTok'
            >
              <SiTiktok />
            </a>
          </div>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link href='/'>Home</Link>
          <Link href='/products'>Products</Link>
          <Link href='/about'>About Us</Link>
          <Link href='/reviews'>Customer Reviews</Link>
          <Link href='/contact'>Contact</Link>
          <Link href='/faqs'>FAQ</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <p>
            Customer Support:
            <br />
            <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a>
          </p>
          {contact.generalEmail !== contact.supportEmail && (
            <p>
              General Enquiries:
              <br />
              <a href={`mailto:${contact.generalEmail}`}>
                {contact.generalEmail}
              </a>
            </p>
          )}
          <p>
            Phone:
            <br />
            <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>
              {contact.phone}
            </a>
          </p>
        </div>
      </div>
      <div className='footer-bottom'>
        <nav aria-label='Policies'>
          <Link href='/shipping'>Shipping &amp; Delivery</Link>
          <Link href='/returns'>Returns &amp; Exchanges</Link>
          <Link href='/privacy'>Privacy Policy</Link>
          <Link href='/terms'>Terms &amp; Conditions</Link>
        </nav>
        © Care &amp; Clean Nepal — All Rights Reserved.
        <small>
          Site by{' '}
          <a
            href='https://convolutionlab.com'
            target='_blank'
            rel='noopener noreferrer'
          >
            Convolution Lab
          </a>
        </small>
      </div>
    </footer>
  );
}
