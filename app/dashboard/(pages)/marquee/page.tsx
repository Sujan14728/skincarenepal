'use client';
import React, { useEffect, useState } from 'react';

type MarqueeType = { id: number; text: string };

export default function MarqueeDashboard() {
  const [marquees, setMarquees] = useState<MarqueeType[]>([]);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const fetchMarquees = async () => {
    const res = await fetch('/api/marquee');
    const data = await res.json();
    setMarquees(data.marquees || []);
  };

  const addMarquee = async () => {
    if (!newText) return;
    await fetch('/api/marquee', {
      method: 'POST',
      body: JSON.stringify({ text: newText }),
      headers: { 'Content-Type': 'application/json' }
    });
    setNewText('');
    fetchMarquees();
  };

  const startEdit = (marquee: MarqueeType) => {
    setEditingId(marquee.id);
    setEditingText(marquee.text);
  };

  const saveEdit = async () => {
    if (!editingText || editingId === null) return;
    await fetch(`/api/marquee/${editingId}`, {
      method: 'PUT',
      body: JSON.stringify({ text: editingText }),
      headers: { 'Content-Type': 'application/json' }
    });
    setEditingId(null);
    setEditingText('');
    fetchMarquees();
  };

  const deleteMarquee = async (id: number) => {
    await fetch(`/api/marquee/${id}`, { method: 'DELETE' });
    fetchMarquees();
  };

  useEffect(() => {
    fetchMarquees();
  }, []);

  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Marquee Dashboard</h1>

      <div className='mb-4 flex gap-2'>
        <input
          type='text'
          placeholder='Add new marquee'
          className='flex-1 rounded border p-2'
          value={newText}
          onChange={e => setNewText(e.target.value)}
        />
        <button
          className='rounded bg-emerald-700 px-4 text-white'
          onClick={addMarquee}
        >
          Add
        </button>
      </div>

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
                />
                <button
                  className='rounded bg-blue-600 px-3 py-1 text-white'
                  onClick={saveEdit}
                >
                  Save
                </button>
              </div>
            ) : (
              <span>{m.text}</span>
            )}
            <div className='flex gap-2'>
              <button
                className='rounded bg-yellow-500 px-3 py-1 text-white'
                onClick={() => startEdit(m)}
              >
                Edit
              </button>
              <button
                className='rounded bg-red-600 px-3 py-1 text-white'
                onClick={() => deleteMarquee(m.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
