'use client';

import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import ConfirmDelete from '@/components/dashboard/ConfirmDelete';
import { Field } from '@/components/dashboard/form';
import { cn } from '@/lib/utils';

type MarqueeType = {
  id: number;
  text: string;
  createdAt?: string;
  updatedAt?: string;
};

const MAX_LENGTH = 500;
// The storefront shows the 10 newest announcements.
const MAX_SHOWN = 10;

function CharCount({ value }: { value: string }) {
  const near = value.length > MAX_LENGTH * 0.9;
  return (
    <span
      className={cn(
        'text-xs tabular-nums text-muted-foreground',
        near && 'font-medium text-destructive'
      )}
    >
      {value.length}/{MAX_LENGTH}
    </span>
  );
}

export default function MarqueeDashboard() {
  const [marquees, setMarquees] = useState<MarqueeType[]>([]);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchMarquees = async () => {
    try {
      setFetching(true);
      const res = await fetch('/api/marquee', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch marquees');
      const data = await res.json();
      setMarquees(data.marquees || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Could not load announcements. Refresh the page to try again.');
    } finally {
      setFetching(false);
    }
  };

  const addMarquee = async () => {
    const trimmedText = newText.trim();
    if (!trimmedText || trimmedText.length > MAX_LENGTH) {
      toast.error('Text is required and must be under 500 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/marquee', {
        method: 'POST',
        body: JSON.stringify({ text: trimmedText }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add announcement');
      }

      const created = await res.json();
      toast.success('Announcement added');
      setNewText('');
      setMarquees(prev => [created, ...prev].slice(0, MAX_SHOWN));
    } catch (error) {
      console.error('Add error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to add announcement'
      );
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (marquee: MarqueeType) => {
    setEditingId(marquee.id);
    setEditingText(marquee.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = async () => {
    const trimmedText = editingText.trim();
    if (!trimmedText || trimmedText.length > MAX_LENGTH) {
      toast.error('Text is required and must be under 500 characters');
      return;
    }
    if (editingId === null) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/marquee/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ text: trimmedText }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update announcement');
      }

      const updated = await res.json();
      toast.success('Announcement saved');
      cancelEdit();
      setMarquees(prev => prev.map(m => (m.id === updated.id ? updated : m)));
    } catch (error) {
      console.error('Update error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update announcement'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteMarquee = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marquee/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete announcement');
      }

      toast.success('Announcement deleted');
      setMarquees(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete announcement'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarquees();
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Announcements'
        description='Short messages that scroll in the bar above the storefront menu. Remove them all to hide the bar.'
      />

      {/* Preview */}
      <section className='flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs'>
        <div className='flex flex-wrap items-baseline justify-between gap-2'>
          <h2 className='text-sm font-semibold text-foreground'>Preview</h2>
          <p className='text-xs text-muted-foreground'>
            {marquees.length > 0
              ? 'Messages scroll continuously on the storefront.'
              : 'The bar is hidden while there are no announcements.'}
          </p>
        </div>
        <div
          className={cn(
            'relative overflow-hidden rounded-lg bg-foreground py-2.5 text-background',
            marquees.length === 0 && !fetching && 'opacity-40'
          )}
          aria-hidden
        >
          <div className='flex items-center gap-4 whitespace-nowrap px-4 text-[13px] font-medium'>
            {fetching ? (
              <Skeleton className='h-4 w-2/3 bg-background/20' />
            ) : marquees.length === 0 ? (
              <span className='text-background/70'>No announcements</span>
            ) : (
              marquees.map((m, i) => (
                <Fragment key={m.id}>
                  {i > 0 && <span className='text-background/40'>•</span>}
                  <span>{m.text}</span>
                </Fragment>
              ))
            )}
          </div>
          <span className='pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-foreground to-transparent' />
        </div>
      </section>

      <section className='rounded-xl border bg-card shadow-xs'>
        {/* Add form */}
        <form
          className='flex flex-col gap-2 border-b p-4'
          onSubmit={e => {
            e.preventDefault();
            addMarquee();
          }}
        >
          <Field
            label='New announcement'
            htmlFor='new-announcement'
            hint={
              <span className='flex justify-between gap-2'>
                <span>Keep it short so it reads in one glance.</span>
                <CharCount value={newText} />
              </span>
            }
          >
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Input
                id='new-announcement'
                type='text'
                placeholder='e.g. Free delivery inside Kathmandu valley on orders above Rs. 1,500'
                value={newText}
                onChange={e => setNewText(e.target.value)}
                disabled={loading}
                maxLength={MAX_LENGTH}
              />
              <Button
                type='submit'
                className='shrink-0'
                disabled={loading || !newText.trim()}
              >
                {loading && editingId === null ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <Plus />
                )}
                Add announcement
              </Button>
            </div>
          </Field>
        </form>

        {/* List */}
        <div className='flex items-center justify-between gap-2 bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          <span>Messages</span>
          <span className='tabular-nums normal-case tracking-normal'>
            {marquees.length} of {MAX_SHOWN} shown
          </span>
        </div>

        {fetching ? (
          <ul className='divide-y'>
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className='flex items-center gap-3 px-4 py-3'>
                <Skeleton className='size-6 rounded-full' />
                <Skeleton className='h-4 flex-1' />
              </li>
            ))}
          </ul>
        ) : marquees.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title='No announcements'
            description='The announcement bar is hidden until you add one.'
          />
        ) : (
          <ul className='divide-y'>
            {marquees.map((m, index) => (
              <li
                key={m.id}
                className='flex items-start gap-3 px-4 py-3 hover:bg-muted/30'
              >
                <span className='mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground'>
                  {index + 1}
                </span>
                {editingId === m.id ? (
                  <form
                    className='flex flex-1 flex-col gap-2'
                    onSubmit={e => {
                      e.preventDefault();
                      saveEdit();
                    }}
                  >
                    <Input
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      disabled={loading}
                      maxLength={MAX_LENGTH}
                      aria-label='Announcement text'
                      autoFocus
                    />
                    <div className='flex items-center justify-between gap-2'>
                      <CharCount value={editingText} />
                      <div className='flex gap-2'>
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          onClick={cancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button type='submit' size='sm' disabled={loading}>
                          {loading && <Loader2 className='animate-spin' />}
                          Save
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className='mt-0.5 min-w-0 flex-1 break-words text-sm text-foreground'>
                      {m.text}
                    </p>
                    <div className='-my-1 flex shrink-0 items-center'>
                      <Button
                        size='icon-sm'
                        variant='ghost'
                        onClick={() => startEdit(m)}
                        disabled={loading}
                        aria-label='Edit announcement'
                      >
                        <Pencil />
                      </Button>
                      <ConfirmDelete
                        title='Delete announcement?'
                        description='It will be removed from the storefront bar straight away.'
                        confirmLabel='Delete announcement'
                        onConfirm={() => deleteMarquee(m.id)}
                      >
                        <Button
                          size='icon-sm'
                          variant='ghost'
                          disabled={loading}
                          aria-label='Delete announcement'
                          className='text-muted-foreground hover:text-destructive'
                        >
                          <Trash2 />
                        </Button>
                      </ConfirmDelete>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
