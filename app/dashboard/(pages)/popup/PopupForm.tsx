'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';

interface PopupDetail {
  name: string;
  image: string;
}

interface PopupContent {
  id?: number;
  title: string;
  description?: string;
  popupdetails: PopupDetail[];
}

interface PopupFormProps {
  popup?: PopupContent;
  onSuccess: () => void;
  onCancel: () => void;
}

const PopupForm = ({ popup, onSuccess, onCancel }: PopupFormProps) => {
  const [formData, setFormData] = useState<PopupContent>({
    title: popup?.title || '',
    description: popup?.description || '',
    popupdetails: popup?.popupdetails || []
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentDetailIndexRef = useRef<number | null>(null);

  const handleInputChange = (field: keyof PopupContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- Popup Details Handlers ---
  const handleDetailChange = (
    index: number,
    field: keyof PopupDetail,
    value: string
  ) => {
    const updated = [...formData.popupdetails];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, popupdetails: updated }));
  };

  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      popupdetails: [...prev.popupdetails, { name: '', image: '' }]
    }));
  };

  const removeDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      popupdetails: prev.popupdetails.filter((_, i) => i !== index)
    }));
  };

  // --- Image Upload for Popup Details ---
  const handleImageUpload = async (file: File, index: number) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'popup'); // save to public/images/popup
      formData.append('useUniqueFileName', 'true');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      handleDetailChange(index, 'image', data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || currentDetailIndexRef.current === null) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    handleImageUpload(file, currentDetailIndexRef.current);
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error('Please provide a title');
      return;
    }

    setLoading(true);
    try {
      const url = popup ? `/api/popup/${popup.id}` : '/api/popup';
      const method = popup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(`Popup ${popup ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save popup');
      }
    } catch (error) {
      console.error('Error saving popup:', error);
      toast.error('Error saving popup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Title */}
      <div>
        <Label className='pb-2' htmlFor='title'>
          Popup Title *
        </Label>
        <Input
          id='title'
          value={formData.title}
          onChange={e => handleInputChange('title', e.target.value)}
          placeholder='Enter popup title'
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label className='pb-2' htmlFor='description'>
          Description
        </Label>
        <Textarea
          id='description'
          value={formData.description || ''}
          onChange={e => handleInputChange('description', e.target.value)}
          placeholder='Enter short description'
          rows={3} // adjust for short text
        />
      </div>

      {/* Popup Details */}
      <div className='space-y-4'>
        <Label>Popup Details</Label>
        {formData.popupdetails.map((detail, index) => (
          <div key={index} className='flex items-center space-x-2'>
            <Input
              value={detail.name}
              onChange={e => handleDetailChange(index, 'name', e.target.value)}
              placeholder='Detail name'
            />
            <div className='relative'>
              {detail.image && (
                <Image
                  src={detail.image}
                  width={64}
                  height={64}
                  alt='Popup Detail'
                  className='rounded border object-cover'
                />
              )}
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='cursor-pointer'
                onClick={() => {
                  currentDetailIndexRef.current = index;
                  fileInputRef.current?.click();
                }}
              >
                {detail.image ? 'Change Image' : 'Upload Image'}
              </Button>
            </div>
            <Button
              type='button'
              size='sm'
              variant='destructive'
              onClick={() => removeDetail(index)}
              className='cursor-pointer'
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        ))}
        <Button
          type='button'
          onClick={addDetail}
          variant='outline'
          className='cursor-pointer'
        >
          Add Detail
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        className='hidden'
      />

      {/* Submit */}
      <div className='flex justify-end space-x-2'>
        <Button
          className='cursor-pointer'
          type='submit'
          disabled={loading || uploading}
        >
          {loading ? 'Saving...' : popup ? 'Update Popup' : 'Create Popup'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={loading || uploading}
          className='cursor-pointer'
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PopupForm;
