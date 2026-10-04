'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import ConfirmDelete from '@/components/dashboard/ConfirmDelete';
import FormSheet from '@/components/dashboard/FormSheet';
import {
  Field,
  FormBody,
  FormFooter,
  FormSection
} from '@/components/dashboard/form';

type TeamMember = {
  id: number;
  name: string;
  title: string;
  image: string;
};

const EMPTY_FORM = { name: '', title: '', image: '' };

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
}

export default function TeamDashboardSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/team-member');
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load team members. Refresh the page to try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    e.target.value = '';
    if (!selectedFile) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folder', 'members/images');
    formData.append('useUniqueFileName', 'true');

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Upload failed:', data.error);
        toast.error('Photo upload failed. Try a different image.');
        return;
      }

      setForm(prev => ({ ...prev, image: data.url }));
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Photo upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;

    setSaving(true);
    try {
      const res = await fetch('/api/team-member', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Save failed');

      toast.success(editingId ? 'Team member saved' : 'Team member added');
      await fetchMembers();
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error('Could not save team member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch('/api/team-member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!res.ok) throw new Error('Delete failed');

      toast.success('Team member deleted');
      await fetchMembers();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete team member. Please try again.');
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (member: TeamMember) => {
    setForm({ name: member.name, title: member.title, image: member.image });
    setEditingId(member.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const addButton = (
    <Button onClick={openCreate}>
      <Plus />
      Add team member
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='About us'
        description='The team members shown on the storefront About page.'
        actions={addButton}
      />

      {loading ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xs'
            >
              <Skeleton className='aspect-[4/5] w-full rounded-lg' />
              <Skeleton className='h-4 w-2/3' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <section className='rounded-xl border bg-card shadow-xs'>
          <EmptyState
            icon={Users}
            title='No team members yet'
            description='Add the people behind Care & Clean. They appear on the About page in the order they were added.'
            action={addButton}
          />
        </section>
      ) : (
        <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {members.map(member => (
            <li
              key={member.id}
              className='group flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xs'
            >
              <div className='relative aspect-[4/5] overflow-hidden rounded-lg border bg-accent'>
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes='(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 90vw'
                    className='object-cover'
                  />
                ) : (
                  <span className='grid size-full place-items-center font-display text-3xl font-semibold text-accent-foreground'>
                    {initials(member.name)}
                  </span>
                )}
              </div>
              <div className='flex items-start justify-between gap-2 px-1'>
                <div className='flex min-w-0 flex-col gap-0.5'>
                  <p className='truncate font-medium text-foreground'>
                    {member.name}
                  </p>
                  <p className='truncate text-sm text-muted-foreground'>
                    {member.title}
                  </p>
                </div>
                <div className='flex shrink-0 items-center'>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={() => handleEdit(member)}
                    aria-label={`Edit ${member.name}`}
                  >
                    <Pencil />
                  </Button>
                  <ConfirmDelete
                    title='Delete team member?'
                    description={`${member.name} will be removed from the About page. This can't be undone.`}
                    confirmLabel='Delete team member'
                    onConfirm={() => handleDelete(member.id)}
                  >
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      className='text-muted-foreground hover:text-destructive'
                      aria-label={`Delete ${member.name}`}
                    >
                      <Trash2 />
                    </Button>
                  </ConfirmDelete>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FormSheet
        open={showForm}
        onOpenChange={open => {
          if (!open) resetForm();
        }}
        title={editingId ? 'Edit team member' : 'Add team member'}
        description='Shown on the storefront About page.'
      >
        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          <FormBody>
            <FormSection
              title='Photo'
              description='A portrait works best. JPG, PNG or WebP.'
            >
              <div className='flex items-end gap-4'>
                {form.image ? (
                  <div className='relative aspect-[4/5] w-36 overflow-hidden rounded-lg border'>
                    <Image
                      src={form.image}
                      alt='Team member photo'
                      fill
                      sizes='144px'
                      className='object-cover'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon-sm'
                      className='absolute right-1.5 top-1.5 size-7 rounded-full bg-background/90'
                      onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      aria-label='Remove photo'
                    >
                      <X />
                    </Button>
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className='flex aspect-[4/5] w-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3 text-center text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/40 disabled:pointer-events-none'
                  >
                    {uploading ? (
                      <Loader2 className='size-5 animate-spin' />
                    ) : (
                      <ImagePlus className='size-5' />
                    )}
                    <span className='text-xs font-medium'>
                      {uploading ? 'Uploading…' : 'Upload photo'}
                    </span>
                  </button>
                )}
                {form.image && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className='animate-spin' />
                    ) : (
                      <RefreshCw />
                    )}
                    {uploading ? 'Uploading…' : 'Replace photo'}
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
              />
            </FormSection>

            <FormSection title='Details'>
              <Field label='Name' htmlFor='member-name' required>
                <Input
                  id='member-name'
                  placeholder='e.g. Aasha Shrestha'
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Field>
              <Field
                label='Title'
                htmlFor='member-title'
                hint='Their role, shown under the name.'
                required
              >
                <Input
                  id='member-title'
                  placeholder='e.g. Founder & formulator'
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </Field>
            </FormSection>
          </FormBody>
          <FormFooter>
            <Button variant='outline' type='button' onClick={resetForm}>
              Cancel
            </Button>
            <Button type='submit' disabled={uploading || saving}>
              {saving && <Loader2 className='animate-spin' />}
              {editingId ? 'Save changes' : 'Add team member'}
            </Button>
          </FormFooter>
        </form>
      </FormSheet>
    </div>
  );
}
