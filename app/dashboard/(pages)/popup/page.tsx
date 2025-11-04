'use client';

import { useEffect, useState } from 'react';
import PopupForm from './PopupForm';

interface PopupDetail {
  id: number;
  name: string;
  image: string;
}

interface Popup {
  id: number;
  title: string;
  description: string;
  popupdetails: PopupDetail[];
}

export default function PopupDashboard() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchPopups = async () => {
    const res = await fetch('/api/popup');
    const data = await res.json();
    setPopups(
      Array.isArray(data) ? data : Array.isArray(data.popups) ? data.popups : []
    );
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;
    await fetch(`/api/popup/${id}`, { method: 'DELETE' });
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

  const handleFormSuccess = () => {
    setEditingPopup(null);
    setShowForm(false);
    fetchPopups();
  };

  return (
    <div className='relative p-6'>
      <h1 className='mb-6 text-3xl font-bold'>Popup Dashboard</h1>

      {/* Add Popup Button */}
      <button
        onClick={openAddForm}
        className='bg-primary mb-4 cursor-pointer rounded px-4 py-2 text-white'
      >
        Add Popup
      </button>

      {/* Popup List */}
      <div className='space-y-4 rounded-2xl p-6 shadow-2xl'>
        {popups.map(p => (
          <div
            key={p.id}
            className='flex items-center justify-between rounded-lg border p-4'
          >
            <div>
              <h2 className='text-sm font-semibold'>{p.title}</h2>
              <p className='text-xs'>{p.description}</p>
            </div>
            <div className='space-x-2'>
              <button
                onClick={() => openEditForm(p)}
                className='bg-primary cursor-pointer rounded px-2 py-1 text-white'
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className='cursor-pointer rounded bg-red-500 px-1 py-1 text-white'
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <>
          {/* Overlay */}
          <div
            className='fixed inset-0 z-40 bg-black opacity-50'
            onClick={() => setShowForm(false)}
          />

          {/* Form Modal */}
          <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div className='relative w-full max-w-lg rounded-lg bg-white p-6'>
              <button
                className='absolute top-2 right-2 text-gray-500 hover:text-gray-800'
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
              <PopupForm
                popup={editingPopup || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
