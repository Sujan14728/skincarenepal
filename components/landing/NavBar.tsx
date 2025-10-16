// components/NavBar.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LuMenu } from 'react-icons/lu';
import Image from 'next/image';
import CartBadge from './cart/CartBadge';

// Define your navigation links
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
  // { href: '/careers', label: 'Careers' }
];

export function NavBar() {
  return (
    <nav className='border-border bg-background text-muted-foreground flex items-center justify-between border-b px-4'>
      <div className='flex items-center space-x-2'>
        <div className='bg-primary text-primary-foreground flex h-20 w-20 items-center justify-center'>
          <Image
            height={24}
            width={24}
            alt='Care And Clean Nepal'
            src={'/images/logo.jpg'}
            className='h-full w-full'
            unoptimized
          />
        </div>
      </div>

      <div className='hidden items-center space-x-6 md:flex'>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className='hover:text-primary transition-colors'
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className='flex items-center space-x-4'>
        <Link
          href='/orders'
          className='hover:text-primary hidden transition-colors md:block'
        >
          Orders
        </Link>
        <CartBadge />

        <div className='md:hidden'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon'>
                <LuMenu className='h-6 w-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right'>
              <div className='flex flex-col space-y-4 pt-8'>
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className='hover:text-primary text-lg transition-colors'
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href='/orders'
                  className='hover:text-primary text-lg transition-colors'
                >
                  Orders
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
