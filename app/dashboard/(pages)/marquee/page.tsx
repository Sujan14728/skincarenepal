'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type MarqueeType = {
  id: number;
  text: string;
  createdAt?: string; // Optional, if you want to display
  updatedAt?: string;
};

export default function MarqueeDashboard() {
  const [marquees, setMarquees] = useState<MarqueeType[]>([]);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // For initial load

  const fetchMarquees = async () => {
    try {
      setFetching(true);
      const res = await fetch('/api/marquee'); // Updated to plural
      if (!res.ok) throw new Error('Failed to fetch marquees');
      const data = await res.json();
      setMarquees(data.marquees || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load marquees');
    } finally {
      setFetching(false);
    }
  };

  const addMarquee = async () => {
    const trimmedText = newText.trim();
    if (!trimmedText || trimmedText.length > 500) {
      toast.error('Text is required and must be under 500 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/marquee', {
        // Updated to plural
        method: 'POST',
        body: JSON.stringify({ text: trimmedText }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add marquee');
      }

      toast.success('Marquee added successfully');
      setNewText('');
      fetchMarquees();
    } catch (error) {
      console.error('Add error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to add marquee'
      );
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (marquee: MarqueeType) => {
    setEditingId(marquee.id);
    setEditingText(marquee.text);
  };

  const saveEdit = async () => {
    const trimmedText = editingText.trim();
    if (!trimmedText || trimmedText.length > 500) {
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
        throw new Error(error.error || 'Failed to update marquee');
      }

      toast.success('Marquee updated successfully');
      setEditingId(null);
      setEditingText('');
      fetchMarquees();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update marquee'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteMarquee = async (id: number) => {
    if (!confirm('Are you sure you want to delete this marquee?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/marquee/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete marquee');
      }

      toast.success('Marquee deleted successfully');
      fetchMarquees();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete marquee'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarquees();
  }, []);

  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Marquee Dashboard</h1>

      <form
        className='mb-4 flex gap-2'
        onSubmit={e => {
          e.preventDefault();
          addMarquee();
        }}
      >
        <input
          type='text'
          placeholder='Add new marquee (max 500 chars)'
          className='flex-1 rounded border p-2'
          value={newText}
          onChange={e => setNewText(e.target.value)}
          disabled={loading}
          maxLength={500}
        />
        <button
          type='submit'
          className='rounded bg-emerald-700 px-4 py-2 text-white disabled:opacity-50'
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>

      {fetching ? (
        <p className='text-center'>Loading marquees...</p>
      ) : (
        <ul className='space-y-2'>
          {marquees.map(m => (
            <li
              key={m.id}
              className='flex items-center justify-between rounded border p-2'
            >
              {editingId === m.id ? (
                <div className='flex flex-1 gap-2'>
                  <input
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    className='flex-1 rounded border p-1'
                    disabled={loading}
                    maxLength={500}
                  />
                  <button
                    className='rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50'
                    onClick={saveEdit}
                    disabled={loading}
                    aria-label='Save edit'
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className='rounded bg-gray-500 px-3 py-1 text-white'
                    onClick={() => {
                      setEditingId(null);
                      setEditingText('');
                    }}
                    disabled={loading}
                    aria-label='Cancel edit'
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <span>{m.text}</span>
              )}
              {editingId !== m.id && (
                <div className='flex gap-2'>
                  <button
                    className='rounded bg-yellow-500 px-3 py-1 text-white disabled:opacity-50'
                    onClick={() => startEdit(m)}
                    disabled={loading}
                    aria-label='Edit marquee'
                  >
                    Edit
                  </button>
                  <button
                    className='rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50'
                    onClick={() => deleteMarquee(m.id)}
                    disabled={loading}
                    aria-label='Delete marquee'
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {marquees.length === 0 && !fetching && (
        <p className='mt-4 text-center text-gray-500'>
          No marquees yet. Add one above!
        </p>
      )}
    </div>
  );
}
