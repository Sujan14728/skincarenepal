'use client';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContactDetails } from './ContactDetails';
import { toast } from 'sonner';

type Contact = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contact?q=${search}`);
      const data = await res.json();
      if (res.ok) setContacts(data.contacts || []);
      else toast.error(data.error);
    } catch {
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Delete contact
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        toast.success('Contact deleted successfully');
        setContacts(prev => prev.filter(c => c.id !== id));
        setSelected(null); // close details view if deleted
      } else {
        toast.error(data.error || 'Failed to delete contact');
      }
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  return (
    <div className='rounded-2xl bg-white p-6 shadow-md'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Contact Messages</h2>
        <div className='flex gap-2'>
          <Input
            placeholder='Search...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button onClick={fetchContacts}>Search</Button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className='divide-y'>
          {contacts.map(c => (
            <li
              key={c.id}
              className='cursor-pointer p-3 hover:bg-gray-100'
              onClick={() => setSelected(c)}
            >
              <p className='font-semibold'>{c.name}</p>
              <p className='text-sm text-gray-600'>{c.email}</p>
              <p className='text-xs text-gray-500'>
                {c.subject} • {c.status}
              </p>
            </li>
          ))}
        </ul>
      )}

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
