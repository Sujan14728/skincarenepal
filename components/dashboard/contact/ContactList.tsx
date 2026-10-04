'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from 'react';
import dayjs from 'dayjs';
import {
  Inbox,
  MailSearch,
  MousePointerClick,
  RefreshCw,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/dashboard/EmptyState';
import FormSheet from '@/components/dashboard/FormSheet';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import {
  ContactDetails,
  STATUS_META,
  type Contact,
  type ContactStatus
} from './ContactDetails';

type Filter = 'ALL' | 'UNREAD' | 'REPLIED' | 'ARCHIVED';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'ARCHIVED', label: 'Archived' }
];

const STATUS_TOAST: Record<ContactStatus, string> = {
  UNREAD: 'Marked as unread',
  READ: 'Marked as read',
  REPLIED: 'Marked as replied',
  ARCHIVED: 'Message archived'
};

/** Inbox-style date: time today, weekday this week, else a short date. */
const inboxDate = (value: string) => {
  const date = dayjs(value);
  const now = dayjs();
  if (date.isSame(now, 'day')) return date.format('h:mm A');
  if (now.diff(date, 'day') < 6) return date.format('ddd');
  if (date.isSame(now, 'year')) return date.format('D MMM');
  return date.format('D MMM YYYY');
};

const DESKTOP_QUERY = '(min-width: 1024px)';
const subscribeDesktop = (callback: () => void) => {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};
const useIsDesktop = () =>
  useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true
  );

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 500);
  const isDesktop = useIsDesktop();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contact?q=${debouncedSearch}`);
      const data = await res.json();
      if (res.ok) setContacts(data.contacts || []);
      else toast.error(data.error);
    } catch {
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        toast.success('Message deleted');
        setContacts(prev => prev.filter(c => c.id !== id));
        setSelectedId(null);
      } else {
        toast.error(data.error || 'Failed to delete message');
      }
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleStatusChange = async (id: number, newStatus: ContactStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');

      setContacts(prev =>
        prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
      );
      toast.success(STATUS_TOAST[newStatus]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = useMemo(() => {
    const result: Record<Filter, number> = {
      ALL: contacts.length,
      UNREAD: 0,
      REPLIED: 0,
      ARCHIVED: 0
    };
    for (const c of contacts) {
      if (c.status !== 'READ') result[c.status] += 1;
    }
    return result;
  }, [contacts]);

  const visible = useMemo(
    () =>
      filter === 'ALL' ? contacts : contacts.filter(c => c.status === filter),
    [contacts, filter]
  );

  const selected = contacts.find(c => c.id === selectedId) ?? null;

  const details = selected && (
    <ContactDetails
      key={selected.id}
      contact={selected}
      updating={updatingId === selected.id}
      onStatusChange={status => handleStatusChange(selected.id, status)}
      onDelete={() => handleDelete(selected.id)}
    />
  );

  return (
    <section className='grid overflow-hidden rounded-xl border bg-card shadow-xs lg:h-[calc(100dvh-15rem)] lg:min-h-[560px] lg:grid-cols-[minmax(320px,400px)_1fr]'>
      {/* List pane */}
      <div className='flex min-h-0 flex-col lg:border-r'>
        <div className='flex shrink-0 flex-col gap-3 border-b p-4'>
          <div className='flex items-center gap-2'>
            <div className='relative flex-1'>
              <Search
                className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
                aria-hidden
              />
              <Input
                type='search'
                placeholder='Search name, email or message'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-9'
                aria-label='Search messages'
              />
            </div>
            <Button
              variant='outline'
              size='icon'
              onClick={fetchContacts}
              disabled={loading}
              aria-label='Refresh messages'
              title='Refresh'
            >
              <RefreshCw className={cn(loading && 'animate-spin')} />
            </Button>
          </div>
          <div
            role='tablist'
            aria-label='Filter messages'
            className='flex gap-1 overflow-x-auto'
          >
            {FILTERS.map(f => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type='button'
                  role='tab'
                  aria-selected={active}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      'min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums',
                      active ? 'bg-background/70' : 'bg-muted'
                    )}
                  >
                    {counts[f.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto'>
          {loading && contacts.length === 0 ? (
            <ul className='divide-y'>
              {Array.from({ length: 7 }).map((_, i) => (
                <li key={i} className='flex flex-col gap-2 px-4 py-3.5'>
                  <div className='flex justify-between gap-4'>
                    <Skeleton className='h-4 w-1/3' />
                    <Skeleton className='h-3 w-10' />
                  </div>
                  <Skeleton className='h-3.5 w-2/3' />
                  <Skeleton className='h-3 w-5/6' />
                </li>
              ))}
            </ul>
          ) : visible.length === 0 ? (
            debouncedSearch ? (
              <EmptyState
                icon={MailSearch}
                title='No messages match your search'
                description='Try a different name, email or keyword.'
                action={
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSearch('')}
                  >
                    Clear search
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title={
                  filter === 'ALL'
                    ? 'No messages yet'
                    : `No ${STATUS_META[filter].label.toLowerCase()} messages`
                }
                description={
                  filter === 'ALL'
                    ? 'Messages sent from the contact form on the website appear here.'
                    : undefined
                }
              />
            )
          ) : (
            <ul className='divide-y'>
              {visible.map(c => {
                const unread = c.status === 'UNREAD';
                const active = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <button
                      type='button'
                      onClick={() => setSelectedId(c.id)}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'relative flex w-full flex-col gap-0.5 px-4 py-3.5 text-left outline-none transition-colors focus-visible:bg-muted/50',
                        active ? 'bg-accent/60' : 'hover:bg-muted/30'
                      )}
                    >
                      {active && (
                        <span
                          className='absolute inset-y-0 left-0 w-[3px] bg-primary'
                          aria-hidden
                        />
                      )}
                      <span className='flex items-center gap-2'>
                        <span
                          className={cn(
                            'size-2 shrink-0 rounded-full',
                            unread ? 'bg-primary' : 'bg-transparent'
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            'min-w-0 flex-1 truncate text-sm',
                            unread
                              ? 'font-semibold text-foreground'
                              : 'font-medium text-foreground/80'
                          )}
                        >
                          {c.name}
                          {unread && <span className='sr-only'> (unread)</span>}
                        </span>
                        <span className='shrink-0 text-xs tabular-nums text-muted-foreground'>
                          {inboxDate(c.createdAt)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'truncate pl-4 text-sm',
                          unread
                            ? 'font-medium text-foreground'
                            : 'text-foreground/80'
                        )}
                      >
                        {c.subject}
                      </span>
                      <span className='flex items-center gap-2 pl-4'>
                        <span className='line-clamp-1 flex-1 text-sm text-muted-foreground'>
                          {c.message}
                        </span>
                        {(c.status === 'REPLIED' ||
                          c.status === 'ARCHIVED') && (
                          <span className='shrink-0 text-xs text-muted-foreground'>
                            {STATUS_META[c.status].label}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Reading pane (desktop) */}
      <div className='hidden min-h-0 flex-col lg:flex'>
        {details || (
          <div className='grid flex-1 place-items-center'>
            <EmptyState
              icon={MousePointerClick}
              title='Select a message'
              description='Pick a message from the list to read it and reply.'
            />
          </div>
        )}
      </div>

      {/* Reading pane (mobile) */}
      {!isDesktop && (
        <FormSheet
          open={!!selected}
          onOpenChange={open => !open && setSelectedId(null)}
          title={selected ? selected.name : 'Message'}
          description={selected?.email}
        >
          {details}
        </FormSheet>
      )}
    </section>
  );
}
