'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pencil, Trash2, Plus } from 'lucide-react';

type TeamMember = {
  id: number;
  name: string;
  title: string;
  image: string;
};

export default function TeamDashboardSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState({ name: '', title: '', image: '' });
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch members
  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/team-member');
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch members');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle image selection & upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
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
        setUploading(false);
        return;
      }

      setForm(prev => ({ ...prev, image: data.url }));
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Add or update member
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;

    try {
      const res = await fetch('/api/team-member', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Save failed');

      await fetchMembers();
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  // Delete member
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this member?')) return;

    try {
      const res = await fetch('/api/team-member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!res.ok) throw new Error('Delete failed');

      await fetchMembers();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  // Edit member
  const handleEdit = (member: TeamMember) => {
    setForm({ name: member.name, title: member.title, image: member.image });
    setFile(null);
    setEditingId(member.id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({ name: '', title: '', image: '' });
    setFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <section className='mx-auto max-w-3xl py-8'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-gray-700'>Team Members</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className='flex items-center gap-2 rounded bg-green-700 px-4 py-2 text-white'
          >
            <Plus size={18} /> Add Member
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className='mb-6 space-y-3 rounded-lg border p-4 shadow-sm'
        >
          <input
            className='w-full border p-2'
            placeholder='Name'
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className='w-full border p-2'
            placeholder='Title'
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='w-full border p-2'
          />
          {uploading && (
            <div className='text-sm text-gray-500'>Uploading image...</div>
          )}
          {(file || form.image) && (
            <div className='flex justify-center'>
              <Image
                src={form.image || URL.createObjectURL(file!)}
                alt='Preview'
                width={64}
                height={64}
                className='rounded-full'
              />
            </div>
          )}
          <div className='flex justify-end gap-2'>
            <button
              type='submit'
              className='rounded bg-green-700 px-4 py-2 text-white'
              disabled={uploading}
            >
              {editingId ? 'Update' : 'Add'}
            </button>
            <button
              type='button'
              onClick={resetForm}
              className='rounded border px-4 py-2'
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Members List */}
      <ul className='space-y-3'>
        {members.map(member => (
          <li
            key={member.id}
            className='flex items-center gap-4 rounded-lg border p-3 shadow-sm'
          >
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                width={60}
                height={60}
                className='rounded-full object-cover'
              />
            ) : (
              <div className='flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gray-200'>
                {member.name[0].toUpperCase()}
              </div>
            )}
            <div className='flex-1'>
              <div className='font-bold'>{member.name}</div>
              <div className='text-sm text-gray-600'>{member.title}</div>
            </div>
            <button
              onClick={() => handleEdit(member)}
              className='rounded bg-blue-600 p-2 text-white hover:bg-blue-700'
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => handleDelete(member.id)}
              className='rounded bg-red-600 p-2 text-white hover:bg-red-700'
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
