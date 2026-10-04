'use client';

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronRight,
  ChevronsUpDown,
  CornerDownLeft,
  ExternalLink,
  Info,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquareQuote,
  Package,
  PanelTop,
  Search,
  Settings,
  ShoppingBag,
  Ticket
} from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AdminContext,
  useAdmin,
  type AdminInfo
} from '@/components/dashboard/AdminContext';

type CountKey = keyof AdminInfo['counts'];
type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  keywords?: string;
  count?: CountKey;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        keywords: 'home analytics sales revenue'
      }
    ]
  },
  {
    label: 'Store',
    items: [
      {
        href: '/dashboard/orders',
        label: 'Orders',
        icon: ShoppingBag,
        keywords: 'payments delivery fulfil',
        count: 'pendingOrders'
      },
      {
        href: '/dashboard/products',
        label: 'Products',
        icon: Package,
        keywords: 'inventory stock catalogue'
      },
      {
        href: '/dashboard/coupons',
        label: 'Coupons',
        icon: Ticket,
        keywords: 'discount promo code'
      }
    ]
  },
  {
    label: 'Content',
    items: [
      {
        href: '/dashboard/reviews',
        label: 'Reviews',
        icon: MessageSquareQuote,
        keywords: 'testimonials instagram'
      },
      {
        href: '/dashboard/about',
        label: 'About us',
        icon: Info,
        keywords: 'team members'
      },
      {
        href: '/dashboard/popup',
        label: 'Popup',
        icon: PanelTop,
        keywords: 'modal banner'
      },
      {
        href: '/dashboard/marquee',
        label: 'Announcements',
        icon: Megaphone,
        keywords: 'marquee ticker bar'
      }
    ]
  },
  {
    label: 'Customers',
    items: [
      {
        href: '/dashboard/contact',
        label: 'Messages',
        icon: Mail,
        keywords: 'contact inbox enquiries',
        count: 'unreadMessages'
      }
    ]
  },
  {
    label: 'System',
    items: [
      {
        href: '/dashboard/settings',
        label: 'Settings',
        icon: Settings,
        keywords: 'shipping qr payment delivery'
      }
    ]
  }
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g =>
  g.items.map(item => ({ ...item, group: g.label }))
);

const isActive = (pathname: string, href: string) =>
  href === '/dashboard' ? pathname === href : pathname.startsWith(href);

const initials = (admin: AdminInfo | null) => {
  const source = admin?.name || admin?.email || 'A';
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? 'A') + (parts[1]?.[0] ?? '')).toUpperCase();
};

function useLogout() {
  const router = useRouter();
  return () =>
    toast.promise(fetch('/api/admin/logout', { method: 'POST' }), {
      loading: 'Logging out…',
      success: () => {
        router.push('/dashboard/login');
        return 'Logged out';
      },
      error: 'Could not log out. Try again.'
    });
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                              */
/* ------------------------------------------------------------------ */

function Brand() {
  return (
    <Link
      href='/dashboard'
      className='flex items-center gap-3 rounded-lg px-2 outline-none focus-visible:ring-2 focus-visible:ring-pine-accent'
    >
      <span className='grid size-9 place-items-center rounded-[10px] bg-pine-accent text-pine shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)]'>
        <Leaf className='size-[18px]' strokeWidth={2.25} aria-hidden />
      </span>
      <span className='leading-tight'>
        <span className='block font-display text-[15px] font-semibold tracking-tight text-pine-foreground'>
          Care &amp; Clean
        </span>
        <span className='flex items-center gap-1.5 text-xs text-pine-muted'>
          <span className='size-1.5 rounded-full bg-pine-accent' aria-hidden />
          Store admin · Nepal
        </span>
      </span>
    </Link>
  );
}

function UserCard() {
  const admin = useAdmin();
  const logout = useLogout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none transition-colors hover:bg-pine-raised focus-visible:ring-2 focus-visible:ring-pine-accent'
        >
          <span className='grid size-9 shrink-0 place-items-center rounded-full bg-pine-raised text-xs font-semibold text-pine-accent ring-1 ring-pine-line'>
            {initials(admin)}
          </span>
          <span className='min-w-0 flex-1 leading-tight'>
            <span className='block truncate text-sm font-medium text-pine-foreground'>
              {admin?.name || 'Administrator'}
            </span>
            <span className='block truncate text-xs text-pine-muted'>
              {admin?.email ?? '…'}
            </span>
          </span>
          <ChevronsUpDown className='size-4 shrink-0 text-pine-muted' aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='top' align='start' className='w-60'>
        <DropdownMenuLabel className='font-normal'>
          <span className='block text-sm font-medium'>
            {admin?.name || 'Administrator'}
          </span>
          <span className='block truncate text-xs text-muted-foreground'>
            {admin?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/dashboard/settings'>
              <Settings />
              Store settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href='/' target='_blank' rel='noopener noreferrer'>
              <ExternalLink />
              View storefront
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout} variant='destructive'>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const admin = useAdmin();

  return (
    <div className='admin-contours flex h-full flex-col bg-pine text-pine-foreground'>
      <div className='flex h-16 shrink-0 items-center px-3'>
        <Brand />
      </div>

      <nav
        aria-label='Main'
        className='flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4'
      >
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className='mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-pine-muted/80'>
              {group.label}
            </p>
            <ul className='flex flex-col gap-0.5'>
              {group.items.map(({ href, label, icon: Icon, count }) => {
                const active = isActive(pathname, href);
                const badge = count ? admin?.counts[count] ?? 0 : 0;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-pine-accent',
                        active
                          ? 'bg-pine-raised text-white shadow-[inset_0_0_0_1px_var(--pine-line)]'
                          : 'text-pine-foreground/75 hover:bg-pine-raised/60 hover:text-white'
                      )}
                    >
                      {active && (
                        <span
                          className='absolute inset-y-2 -left-3 w-[3px] rounded-r-full bg-pine-accent'
                          aria-hidden
                        />
                      )}
                      <Icon
                        className={cn(
                          'size-[18px] shrink-0',
                          active
                            ? 'text-pine-accent'
                            : 'text-pine-muted group-hover:text-pine-foreground'
                        )}
                        aria-hidden
                      />
                      <span className='flex-1'>{label}</span>
                      {badge > 0 && (
                        <span className='min-w-5 rounded-full bg-pine-accent px-1.5 py-px text-center text-[11px] font-semibold tabular-nums text-pine'>
                          {badge}
                          <span className='sr-only'> need attention</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className='shrink-0 border-t border-pine-line p-3'>
        <UserCard />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Command palette (Ctrl/⌘ K): jump to any admin page                   */
/* ------------------------------------------------------------------ */

function CommandPalette({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ITEMS;
    return ALL_ITEMS.filter(item =>
      `${item.label} ${item.group} ${item.keywords ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
    }
  }, [open]);
  useEffect(() => setCursor(0), [query]);
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg [&>button]:hidden'>
        <DialogTitle className='sr-only'>Jump to a page</DialogTitle>
        <DialogDescription className='sr-only'>
          Type to filter admin pages, use the arrow keys to choose, and press
          Enter to open.
        </DialogDescription>
        <div className='flex items-center gap-3 border-b px-4'>
          <Search className='size-4 shrink-0 text-muted-foreground' aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setCursor(c => Math.min(c + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setCursor(c => Math.max(c - 1, 0));
              } else if (e.key === 'Enter' && results[cursor]) {
                e.preventDefault();
                go(results[cursor].href);
              }
            }}
            placeholder='Jump to orders, products, settings…'
            className='h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            role='combobox'
            aria-expanded
            aria-controls='command-results'
            aria-activedescendant={
              results[cursor] ? `cmd-${results[cursor].href}` : undefined
            }
          />
          <kbd className='rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground'>
            Esc
          </kbd>
        </div>
        <ul
          id='command-results'
          ref={listRef}
          role='listbox'
          className='max-h-80 overflow-y-auto p-2'
        >
          {results.length === 0 && (
            <li className='px-3 py-8 text-center text-sm text-muted-foreground'>
              No page matches “{query}”.
            </li>
          )}
          {results.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={item.href}
                id={`cmd-${item.href}`}
                data-index={index}
                role='option'
                aria-selected={index === cursor}
                onMouseMove={() => setCursor(index)}
                onClick={() => go(item.href)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                  index === cursor
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground'
                )}
              >
                <Icon className='size-4 shrink-0' aria-hidden />
                <span className='flex-1 font-medium'>{item.label}</span>
                <span className='text-xs text-muted-foreground'>{item.group}</span>
                {index === cursor && (
                  <CornerDownLeft className='size-3.5 text-muted-foreground' aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Top bar                                                              */
/* ------------------------------------------------------------------ */

function TopBar({
  onOpenMenu,
  onOpenSearch
}: {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
}) {
  const pathname = usePathname();
  const admin = useAdmin();
  const section = ALL_ITEMS.find(item => isActive(pathname, item.href));
  const pending = admin?.counts.pendingOrders ?? 0;
  const unread = admin?.counts.unreadMessages ?? 0;
  const alerts = pending + unread;
  const [isMac, setIsMac] = useState(false);
  useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  return (
    <header className='sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8'>
      <Button
        variant='ghost'
        size='icon'
        className='lg:hidden'
        onClick={onOpenMenu}
        aria-label='Open navigation'
      >
        <Menu />
      </Button>

      <nav aria-label='Breadcrumb' className='hidden items-center gap-2 text-sm sm:flex'>
        <span className='text-muted-foreground'>{section?.group ?? 'Admin'}</span>
        {section && (
          <>
            <ChevronRight className='size-4 text-muted-foreground/60' aria-hidden />
            <span className='font-medium text-foreground'>{section.label}</span>
          </>
        )}
      </nav>

      <div className='ml-auto flex items-center gap-2'>
        <button
          type='button'
          onClick={onOpenSearch}
          className='flex h-9 items-center gap-2 rounded-lg border bg-muted/50 px-3 text-sm text-muted-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 md:w-64'
        >
          <Search className='size-4' aria-hidden />
          <span className='hidden md:inline'>Search pages…</span>
          <kbd className='ml-auto hidden rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] md:inline'>
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
          <span className='sr-only md:hidden'>Search pages</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='relative' aria-label={`Alerts (${alerts})`}>
              <Bell />
              {alerts > 0 && (
                <span className='absolute right-1.5 top-1.5 size-2 rounded-full bg-amber-500 ring-2 ring-background' />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-72'>
            <DropdownMenuLabel>Needs your attention</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts === 0 ? (
              <p className='px-2 py-6 text-center text-sm text-muted-foreground'>
                You’re all caught up.
              </p>
            ) : (
              <DropdownMenuGroup>
                {pending > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard/orders'>
                      <ShoppingBag />
                      <span className='flex-1'>
                        {pending} {pending === 1 ? 'order needs' : 'orders need'} review
                      </span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {unread > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard/contact'>
                      <Mail />
                      <span className='flex-1'>
                        {unread} unread {unread === 1 ? 'message' : 'messages'}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant='outline' size='sm' className='hidden sm:inline-flex' asChild>
          <a href='/' target='_blank' rel='noopener noreferrer'>
            <ExternalLink />
            Storefront
          </a>
        </Button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const pathname = usePathname();

  // Portalled dialogs/sheets render on <body>, so give it the admin theme too.
  useEffect(() => {
    document.body.classList.add('admin-theme');
    return () => document.body.classList.remove('admin-theme');
  }, []);

  // Refresh identity + badge counts on every navigation.
  const loadAdmin = useCallback(() => {
    fetch('/api/admin/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setAdmin(data))
      .catch(() => {});
  }, []);
  useEffect(() => {
    setMenuOpen(false);
    loadAdmin();
  }, [pathname, loadAdmin]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <AdminContext.Provider value={admin}>
      <div className='admin-theme flex min-h-screen bg-canvas text-foreground'>
        <aside className='sticky top-0 hidden h-screen w-64 shrink-0 lg:block'>
          <SidebarNav />
        </aside>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent
            side='left'
            className='w-72 gap-0 border-0 bg-pine p-0 text-pine-foreground [&>button]:text-pine-foreground'
          >
            <SheetTitle className='sr-only'>Navigation</SheetTitle>
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />

        <div className='flex min-w-0 flex-1 flex-col'>
          <TopBar
            onOpenMenu={() => setMenuOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
          />
          <main className='mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
