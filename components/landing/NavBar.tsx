// components/NavBar.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LuMenu } from 'react-icons/lu';
import Image from 'next/image';
// import CartBadge from './cart/CartBadge';

// Define your navigation links
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <nav className='flex h-20 items-center justify-between border-b border-border bg-background px-4 text-muted-foreground'>
      <div className='flex items-center space-x-2'>
        <div className='flex items-center justify-center text-primary'>
          <Image
            height={45}
            width={75}
            alt='Care And Clean Nepal'
            src={'/images/logo1.png'}
            unoptimized
          />
          <div className='flex flex-col items-center border-muted-foreground'>
            <span className='text-lg font-extrabold md:text-xl'>
              Care And Clean Pvt Ltd
            </span>
            <span className='text-xs font-semibold text-gray-500'>
              Care from Nature, Clean by Choice.
            </span>
          </div>
        </div>
      </div>

      <div className='hidden items-center space-x-6 md:flex'>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className='transition-colors hover:text-primary'
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className='flex items-center space-x-4'>
        {/* <CartBadge /> */}

        <div className='md:hidden'>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Open navigation menu'
              >
                <LuMenu className='h-6 w-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right'>
              <div className='mx-5 flex flex-col space-y-4 pt-8'>
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className='text-lg transition-colors hover:text-primary'
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
