// components/NavBar.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LuMenu } from 'react-icons/lu';
// import CartBadge from './cart/CartBadge';

// Define your navigation links
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export function NavBar() {
  return (
    <nav className='border-border bg-background text-muted-foreground flex h-20 items-center justify-between border-b px-4'>
      <div className='flex items-center space-x-2'>
        <div className='text-primary flex items-center justify-center gap-2'>
          {/* <Image
            height={24}
            width={24}
            alt='Care And Clean Nepal'
            src={'/images/logo.jpg'}
            className='h-full w-full'
            unoptimized
          /> */}
          <div className='border-muted-foreground flex flex-col items-center'>
            <span className='text-md font-semibold'>Care and Clean</span>
            <span className='text-xs'>Nepal</span>
          </div>
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
        {/* <CartBadge /> */}

        <div className='md:hidden'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon'>
                <LuMenu className='h-6 w-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right'>
              <div className='mx-5 flex flex-col space-y-4 pt-8'>
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className='hover:text-primary text-lg transition-colors'
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
