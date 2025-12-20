'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  Phone,
  Info,
  Ticket
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

function SidebarLink({
  href,
  label,
  icon: Icon
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

function SidebarContent() {
  const navigate = useRouter();

  const handleLogout = async () => {
    toast.promise(fetch('/api/admin/logout', { method: 'POST' }), {
      success: () => {
        navigate.push('/dashboard/login');
        return 'Logged out successfully';
      },
      loading: 'Logging out...',
      error: 'Error logging out'
    });
  };
  return (
    <div className='flex h-full flex-col justify-between'>
      <div>
        <div className='mb-6 text-lg font-bold'>Care and Clean Nepal</div>
        <nav className='space-y-1'>
          <SidebarLink href='/dashboard' label='Dashboard' icon={Home} />
          <SidebarLink
            href='/dashboard/products'
            label='Products'
            icon={Package}
          />
          <SidebarLink
            href='/dashboard/orders'
            label='Orders'
            icon={ShoppingBag}
          />
          <SidebarLink
            href='/dashboard/coupons'
            label='Coupons'
            icon={Ticket}
          />
          <SidebarLink href='/dashboard/about' label='About Us' icon={Phone} />
          <SidebarLink href='/dashboard/contact' label='Contact' icon={Info} />
          <SidebarLink href='/dashboard/popup' label='Popup' icon={Home} />
          <SidebarLink href='/dashboard/marquee' label='Marquee' icon={Info} />
          <SidebarLink
            href='/dashboard/settings'
            label='Settings'
            icon={Settings}
          />
        </nav>
      </div>

      <Separator className='my-4' />
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={handleLogout}
        className='flex w-full items-center justify-center gap-1'
      >
        <LogOut size={16} />
        Logout
      </Button>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-background'>
      {/* Sidebar for desktop */}
      <aside className='hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card md:p-4'>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon' className='m-2 md:hidden'>
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64 p-4'>
          <SheetHeader>
            <div className='text-lg font-bold'>Skin Care Nepal</div>
          </SheetHeader>
          <ScrollArea className='mt-4 h-full'>
            <SidebarContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className='flex flex-1 flex-col'>
        {/* Topbar */}
        <header className='flex items-center justify-between border-b bg-card px-6 py-3'>
          <h1 className='text-lg font-semibold'>Admin Dashboard</h1>
          <div className='hidden md:flex'>
            <form action='/api/admin/logout' method='POST'>
              <Button type='submit' variant='outline' size='sm'>
                <LogOut size={16} className='mr-1' />
                Logout
              </Button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  );
}
