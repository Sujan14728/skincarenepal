'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImageIcon, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import EmptyState from '@/components/dashboard/EmptyState';
import {
  Field,
  FormBody,
  FormFooter,
  FormSection
} from '@/components/dashboard/form';
import { cn } from '@/lib/utils';

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

/** Mirrors the storefront popup (components/landing/Popup.tsx) at a glance. */
function PopupPreview({ data }: { data: PopupContent }) {
  const [active, setActive] = useState(0);
  const slides = data.popupdetails;
  const index = Math.min(active, Math.max(slides.length - 1, 0));
  const slide = slides[index];

  return (
    <div className='flex justify-center rounded-lg bg-foreground/[0.06] p-4 sm:p-6'>
      <div className='flex w-full max-w-[340px] flex-col items-center gap-2 rounded-2xl bg-card p-6 text-center shadow-xl'>
        <p
          className={cn(
            'text-2xl font-bold leading-tight text-primary',
            !data.title && 'opacity-40'
          )}
        >
          {data.title || 'Popup title'}
        </p>
        {data.description && (
          <p className='px-2 text-sm font-semibold text-muted-foreground'>
            {data.description}
          </p>
        )}

        {slides.length > 0 && (
          <div className='mt-4 flex w-full flex-col items-center gap-3'>
            <div className='relative grid aspect-square w-full max-w-56 place-items-center overflow-hidden rounded-xl bg-muted shadow-md'>
              {slide?.image ? (
                <Image
                  src={slide.image}
                  alt={slide.name || 'Popup slide'}
                  fill
                  sizes='224px'
                  className='object-contain'
                />
              ) : (
                <ImageIcon
                  className='size-8 text-muted-foreground/60'
                  aria-hidden
                />
              )}
            </div>
            <p
              className={cn(
                'text-base font-semibold text-muted-foreground',
                !slide?.name && 'opacity-50'
              )}
            >
              {slide?.name || 'Slide name'}
            </p>
            {slides.length > 1 && (
              <div className='flex items-center gap-2'>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type='button'
                    onClick={() => setActive(i)}
                    className={cn(
                      'size-2 rounded-full transition-colors',
                      i === index
                        ? 'bg-primary'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    )}
                    aria-label={`Preview slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const PopupForm = ({ popup, onSuccess, onCancel }: PopupFormProps) => {
  const [formData, setFormData] = useState<PopupContent>({
    title: popup?.title || '',
    description: popup?.description || '',
    popupdetails: popup?.popupdetails || []
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentDetailIndexRef = useRef<number | null>(null);

  const handleInputChange = (field: keyof PopupContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailChange = (
    index: number,
    field: keyof PopupDetail,
    value: string
  ) => {
    setFormData(prev => {
      const updated = [...prev.popupdetails];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, popupdetails: updated };
    });
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

  const pickImage = (index: number) => {
    currentDetailIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (file: File, index: number) => {
    setUploading(true);
    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'popup');
      formData.append('useUniqueFileName', 'true');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      handleDetailChange(index, 'image', data.url);
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadingIndex(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
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
        toast.success(popup ? 'Popup saved' : 'Popup created');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save popup');
      }
    } catch (error) {
      console.error('Error saving popup:', error);
      toast.error('Could not save popup. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || uploading;

  return (
    <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]'>
      <form
        onSubmit={handleSubmit}
        className='flex min-w-0 flex-col rounded-xl border bg-card shadow-xs'
      >
        <FormBody>
          <FormSection
            title='Content'
            description='The headline and message at the top of the popup.'
          >
            <Field label='Title' htmlFor='popup-title' required>
              <Input
                id='popup-title'
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder='e.g. Dashain offer: 15% off sunscreens'
                required
              />
            </Field>
            <Field
              label='Description'
              htmlFor='popup-description'
              hint='One or two short sentences work best.'
              optional
            >
              <Textarea
                id='popup-description'
                value={formData.description || ''}
                onChange={e =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='e.g. Use code DASHAIN15 at checkout. Valid until Kartik 5.'
                rows={3}
              />
            </Field>
          </FormSection>

          <FormSection
            title='Slides'
            description='Images that rotate inside the popup, each with a caption. Up to 5MB each.'
            action={
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addDetail}
              >
                <Plus />
                Add slide
              </Button>
            }
          >
            {formData.popupdetails.length === 0 ? (
              <div className='rounded-lg border border-dashed'>
                <EmptyState
                  icon={ImagePlus}
                  title='No slides'
                  description='The popup will show only the title and description.'
                />
              </div>
            ) : (
              <ul className='flex flex-col gap-3'>
                {formData.popupdetails.map((detail, index) => (
                  <li
                    key={index}
                    className='flex items-start gap-4 rounded-lg border p-3'
                  >
                    {detail.image ? (
                      <div className='relative size-24 shrink-0'>
                        <button
                          type='button'
                          onClick={() => pickImage(index)}
                          disabled={busy}
                          className='relative block size-full overflow-hidden rounded-lg border'
                          aria-label={`Replace image for slide ${index + 1}`}
                        >
                          <Image
                            src={detail.image}
                            alt={detail.name || `Slide ${index + 1}`}
                            fill
                            sizes='96px'
                            className='object-cover'
                          />
                          {uploadingIndex === index && (
                            <span className='absolute inset-0 grid place-items-center bg-background/70'>
                              <Loader2 className='size-5 animate-spin text-muted-foreground' />
                            </span>
                          )}
                        </button>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon-sm'
                          className='absolute -right-2 -top-2 size-6 rounded-full bg-background'
                          onClick={() => handleDetailChange(index, 'image', '')}
                          aria-label={`Remove image from slide ${index + 1}`}
                        >
                          <X className='size-3' />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type='button'
                        onClick={() => pickImage(index)}
                        disabled={busy}
                        className='flex size-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/40 disabled:pointer-events-none disabled:opacity-60'
                      >
                        {uploadingIndex === index ? (
                          <Loader2 className='size-5 animate-spin' />
                        ) : (
                          <ImagePlus className='size-5' />
                        )}
                        <span className='text-xs font-medium'>
                          {uploadingIndex === index ? 'Uploading…' : 'Upload'}
                        </span>
                      </button>
                    )}

                    <Field
                      label={`Slide ${index + 1} caption`}
                      htmlFor={`slide-${index}`}
                      className='min-w-0 flex-1'
                    >
                      <Input
                        id={`slide-${index}`}
                        value={detail.name}
                        onChange={e =>
                          handleDetailChange(index, 'name', e.target.value)
                        }
                        placeholder='e.g. Vitamin C serum'
                      />
                    </Field>

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      className='shrink-0 text-muted-foreground hover:text-destructive'
                      onClick={() => removeDetail(index)}
                      aria-label={`Remove slide ${index + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </FormSection>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileSelect}
            className='hidden'
          />
        </FormBody>

        <FormFooter className='rounded-b-xl'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={busy}>
            {loading && <Loader2 className='animate-spin' />}
            {popup ? 'Save changes' : 'Create popup'}
          </Button>
        </FormFooter>
      </form>

      <aside className='flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs lg:sticky lg:top-6'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-sm font-semibold text-foreground'>
            Live preview
          </h2>
          <p className='text-xs text-muted-foreground'>
            How visitors see it. On the storefront, slides rotate every few
            seconds.
          </p>
        </div>
        <PopupPreview data={formData} />
      </aside>
    </div>
  );
};

export default PopupForm;
