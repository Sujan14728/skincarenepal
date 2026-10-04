'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageIcon, MessageSquareDashed, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PopupForm from './PopupForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import ConfirmDelete from '@/components/dashboard/ConfirmDelete';

interface PopupDetail {
  id?: number;
  name: string;
  image: string;
}

interface Popup {
  id: number;
  title: string;
  description: string;
  popupdetails: PopupDetail[];
}

type ApiPopup = Omit<Popup, 'popupdetails'> & {
  popupdetails?: PopupDetail[];
  PopupDetails?: PopupDetail[];
};

// The API returns details as `PopupDetails`; the form works with `popupdetails`.
const normalize = (p: ApiPopup): Popup => ({
  id: p.id,
  title: p.title,
  description: p.description,
  popupdetails: (p.popupdetails ?? p.PopupDetails ?? []).map(d => ({
    name: d.name,
    image: d.image
  }))
});

export default function PopupDashboard() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchPopups = async () => {
    try {
      const res = await fetch('/api/popup');
      const data = await res.json();
      const list: ApiPopup[] = Array.isArray(data)
        ? data
        : Array.isArray(data.popups)
          ? data.popups
          : [];
      setPopups(list.map(normalize));
    } catch (error) {
      console.error('Error loading popups:', error);
      toast.error('Could not load popups. Refresh the page to try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/popup/${id}`, { method: 'DELETE' });
    if (res.ok) toast.success('Popup deleted');
    else toast.error('Could not delete popup. Please try again.');
    if (editingPopup?.id === id) {
      setEditingPopup(null);
      setShowForm(false);
    }
    fetchPopups();
  };

  const openAddForm = () => {
    setEditingPopup(null);
    setShowForm(true);
  };

  const openEditForm = (popup: Popup) => {
    setEditingPopup(popup);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingPopup(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    closeForm();
    fetchPopups();
  };

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Popup'
        description='The promotional popup shown to visitors when they open the storefront.'
        actions={
          !showForm && (
            <Button onClick={openAddForm}>
              <Plus />
              New popup
            </Button>
          )
        }
      />

      {showForm ? (
        <PopupForm
          key={editingPopup?.id ?? 'new'}
          popup={editingPopup || undefined}
          onSuccess={handleFormSuccess}
          onCancel={closeForm}
        />
      ) : (
        <section className='rounded-xl border bg-card shadow-xs'>
          <header className='flex flex-col gap-1 border-b p-4'>
            <h2 className='text-base font-semibold text-foreground'>Popups</h2>
            <p className='text-sm text-muted-foreground'>
              Only the newest popup is shown on the storefront. Delete them all
              to turn the popup off.
            </p>
          </header>

          {loading ? (
            <ul className='divide-y'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={i} className='flex items-center gap-4 p-4'>
                  <Skeleton className='size-14 rounded-lg' />
                  <div className='flex flex-1 flex-col gap-2'>
                    <Skeleton className='h-4 w-1/3' />
                    <Skeleton className='h-3 w-2/3' />
                  </div>
                </li>
              ))}
            </ul>
          ) : popups.length === 0 ? (
            <EmptyState
              icon={MessageSquareDashed}
              title='No popup yet'
              description='Visitors see no popup until you create one. Use it for launches, offers or seasonal picks.'
              action={
                <Button onClick={openAddForm}>
                  <Plus />
                  New popup
                </Button>
              }
            />
          ) : (
            <ul className='divide-y'>
              {popups.map((p, index) => {
                const cover = p.popupdetails.find(d => d.image)?.image;
                const count = p.popupdetails.length;
                return (
                  <li
                    key={p.id}
                    className='flex items-center gap-4 p-4 hover:bg-muted/30'
                  >
                    <div className='relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted text-muted-foreground'>
                      {cover ? (
                        <Image
                          src={cover}
                          alt=''
                          fill
                          sizes='56px'
                          className='object-cover'
                        />
                      ) : (
                        <ImageIcon className='size-5' aria-hidden />
                      )}
                    </div>
                    <div className='flex min-w-0 flex-1 flex-col gap-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='truncate font-medium text-foreground'>
                          {p.title}
                        </p>
                        {index === 0 ? (
                          <Badge variant='success'>Live</Badge>
                        ) : (
                          <Badge variant='secondary'>Not shown</Badge>
                        )}
                      </div>
                      {p.description && (
                        <p className='line-clamp-1 text-sm text-muted-foreground'>
                          {p.description}
                        </p>
                      )}
                      <p className='text-xs text-muted-foreground'>
                        {count} {count === 1 ? 'slide' : 'slides'}
                      </p>
                    </div>
                    <div className='flex shrink-0 items-center'>
                      <Button
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => openEditForm(p)}
                        aria-label={`Edit ${p.title}`}
                      >
                        <Pencil />
                      </Button>
                      <ConfirmDelete
                        title='Delete popup?'
                        description={`"${p.title}" and its slides will be removed. This can't be undone.`}
                        confirmLabel='Delete popup'
                        onConfirm={() => handleDelete(p.id)}
                      >
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          className='text-muted-foreground hover:text-destructive'
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash2 />
                        </Button>
                      </ConfirmDelete>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
