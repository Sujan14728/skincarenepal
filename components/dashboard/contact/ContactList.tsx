'use client';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContactDetails } from './ContactDetails';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

type Contact = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
};

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 500);

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
        toast.success('Contact deleted successfully');
        setContacts(prev => prev.filter(c => c.id !== id));
        setSelected(null);
      } else {
        toast.error(data.error || 'Failed to delete contact');
      }
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: Contact['status']
  ) => {
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
      toast.success(`Status updated to ${newStatus}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeVariant = (status: Contact['status']) => {
    switch (status) {
      case 'UNREAD':
        return 'destructive';
      case 'READ':
        return 'success';
      case 'REPLIED':
        return 'default';
      case 'ARCHIVED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
      {/* Header */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-lg font-semibold tracking-tight text-gray-900'>
          Contact Messages
        </h2>
        <div className='flex w-full items-center gap-2 sm:w-auto'>
          <div className='relative flex-1 sm:flex-none'>
            <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search messages...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full pl-9 sm:w-56'
            />
          </div>
          <Button onClick={fetchContacts} variant='secondary'>
            Search
          </Button>
        </div>
      </div>

      {/* Contact List */}
      <div className='overflow-hidden rounded-xl border border-gray-100'>
        {loading ? (
          <ul className='divide-y divide-gray-100'>
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className='p-4'>
                <Skeleton className='mb-2 h-4 w-1/3' />
                <Skeleton className='mb-1 h-3 w-1/2' />
                <Skeleton className='h-3 w-1/4' />
              </li>
            ))}
          </ul>
        ) : contacts.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center text-gray-500'>
            <Search className='mb-2 h-8 w-8 text-gray-400' />
            <p className='text-sm'>No messages found</p>
          </div>
        ) : (
          <ul className='divide-y divide-gray-100'>
            {contacts.map(c => (
              <li
                key={c.id}
                className='group flex cursor-pointer flex-col gap-1 p-4 transition hover:bg-gray-50'
                onClick={() => setSelected(c)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <p className='cursor-pointer font-medium text-gray-900'>
                      {c.name}
                    </p>
                    <Badge variant={getBadgeVariant(c.status)}>
                      {c.status}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Select
                      value={c.status}
                      onValueChange={value =>
                        handleStatusChange(c.id, value as Contact['status'])
                      }
                      disabled={updatingId === c.id}
                    >
                      <SelectTrigger className='h-8 w-[110px] text-xs'>
                        <SelectValue placeholder='Update' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='UNREAD'>Unread</SelectItem>
                        <SelectItem value='READ'>Read</SelectItem>
                        <SelectItem value='REPLIED'>Replied</SelectItem>
                        <SelectItem value='ARCHIVED'>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className='text-sm text-gray-600'>{c.email}</p>
                <p className='mt-1 line-clamp-1 text-xs text-gray-500'>
                  {c.subject} • {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <ContactDetails
          contact={selected}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected.id)}
        />
      )}
    </div>
  );
}
