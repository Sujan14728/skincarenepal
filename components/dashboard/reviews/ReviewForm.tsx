'use client';
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Loader2,
  MessageSquareText,
  Star,
  Upload,
  Video,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Field,
  FieldRow,
  FormBody,
  FormFooter,
  FormSection,
  SwitchField
} from '@/components/dashboard/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ProductOption, ReviewFormValues, ReviewType } from './types';

const TYPES: {
  value: ReviewType;
  label: string;
  hint: string;
  icon: React.ElementType;
}[] = [
  { value: 'TEXT', label: 'Text', hint: 'A comment or DM', icon: MessageSquareText },
  { value: 'IMAGE', label: 'Image', hint: 'Photo or screenshot', icon: ImageIcon },
  { value: 'VIDEO', label: 'Video', hint: 'Reel or story', icon: Video }
];

const NO_PRODUCT = 'none';

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'reviews');
  formData.append('useUniqueFileName', 'true');
  const res = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data as { url: string; thumbnailUrl?: string };
}

/** ImageKit serves a poster frame for any uploaded video at this path. */
const imageKitVideoThumbnail = (url: string) =>
  url.includes('imagekit.io') ? `${url.split('?')[0]}/ik-thumbnail.jpg` : '';

/** 1–5 star picker built on native radios, so arrow keys work out of the box. */
function RatingInput({
  value,
  onChange
}: {
  value: number;
  onChange: (_value: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div
      role='radiogroup'
      aria-label='Rating'
      className='flex items-center gap-3'
      onMouseLeave={() => setHover(null)}
    >
      <div className='flex items-center gap-0.5'>
        {[1, 2, 3, 4, 5].map(n => (
          <label
            key={n}
            className='cursor-pointer rounded-md p-1 transition-transform hover:scale-110 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50'
            onMouseEnter={() => setHover(n)}
          >
            <input
              type='radio'
              name='rating'
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className='sr-only'
            />
            <span className='sr-only'>
              {n} star{n > 1 ? 's' : ''}
            </span>
            <Star
              aria-hidden
              className={cn(
                'size-6 transition-colors',
                n <= shown
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30'
              )}
            />
          </label>
        ))}
      </div>
      <span className='text-sm tabular-nums text-muted-foreground'>
        {value} of 5
      </span>
    </div>
  );
}

/** Dashed upload tile; also accepts a dropped file. */
function DropZone({
  label,
  helper,
  uploading,
  disabled,
  onPick,
  onDropFile
}: {
  label: string;
  helper: string;
  uploading: boolean;
  disabled: boolean;
  onPick: () => void;
  onDropFile: (_file: File | undefined) => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <button
      type='button'
      onClick={onPick}
      disabled={disabled}
      onDragOver={e => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault();
        setOver(false);
        if (!disabled) onDropFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center outline-none transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60',
        over && 'border-primary/50 bg-accent/40'
      )}
    >
      <span className='grid size-10 place-items-center rounded-full bg-accent text-accent-foreground'>
        {uploading ? (
          <Loader2 className='size-5 animate-spin' aria-hidden />
        ) : (
          <Upload className='size-5' aria-hidden />
        )}
      </span>
      <span className='text-sm font-medium text-foreground'>
        {uploading ? 'Uploading…' : label}
      </span>
      <span className='text-xs text-muted-foreground'>{helper}</span>
    </button>
  );
}

export default function ReviewForm({
  initialValues,
  products,
  submitting,
  submitLabel = 'Save changes',
  onSubmit,
  onCancel
}: {
  initialValues: ReviewFormValues;
  products: ProductOption[];
  submitting: boolean;
  submitLabel?: string;
  onSubmit: (_values: ReviewFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [uploading, setUploading] = useState<'media' | 'thumbnail' | null>(
    null
  );
  const mediaInput = useRef<HTMLInputElement>(null);
  const thumbInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ReviewFormValues>(
    key: K,
    value: ReviewFormValues[K]
  ) => setValues(prev => ({ ...prev, [key]: value }));

  const isMedia = values.type !== 'TEXT';
  const isVideo = values.type === 'VIDEO';

  const handleUpload = async (
    file: File | undefined,
    target: 'media' | 'thumbnail'
  ) => {
    if (!file) return;
    if (target === 'media') {
      const expected = values.type === 'VIDEO' ? 'video/' : 'image/';
      if (!file.type.startsWith(expected)) {
        toast.error(
          `Please choose ${values.type === 'VIDEO' ? 'a video' : 'an image'} file.`
        );
        return;
      }
    }
    setUploading(target);
    try {
      const result = await uploadFile(file);
      if (target === 'media') {
        setValues(prev => ({
          ...prev,
          mediaUrl: result.url,
          thumbnailUrl:
            prev.type === 'VIDEO' && !prev.thumbnailUrl
              ? imageKitVideoThumbnail(result.url)
              : prev.thumbnailUrl
        }));
      } else {
        set('thumbnailUrl', result.url);
      }
      toast.success('Uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.customerName.trim()) {
      toast.error('Customer name is required.');
      return;
    }
    if (values.type === 'TEXT' && !values.content.trim()) {
      toast.error('Add the review text.');
      return;
    }
    if (isMedia && !values.mediaUrl.trim()) {
      toast.error(
        `Upload ${values.type === 'VIDEO' ? 'a video' : 'an image'} or paste its URL.`
      );
      return;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={submit} className='flex min-h-0 flex-1 flex-col'>
      <FormBody>
        <FormSection
          title='Review'
          description='What kind of review it is and what the customer said.'
        >
          <Field label='Review type'>
            <div
              role='radiogroup'
              aria-label='Review type'
              className='grid grid-cols-3 gap-2'
            >
              {TYPES.map(({ value, label, hint, icon: Icon }) => {
                const active = values.type === value;
                return (
                  <label
                    key={value}
                    className={cn(
                      'flex cursor-pointer flex-col items-start gap-1 rounded-lg border p-3 transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                      active
                        ? 'border-primary bg-accent ring-1 ring-primary'
                        : 'hover:border-primary/40 hover:bg-muted/40'
                    )}
                  >
                    <input
                      type='radio'
                      name='review-type'
                      value={value}
                      checked={active}
                      onChange={() => set('type', value)}
                      className='sr-only'
                    />
                    <Icon
                      aria-hidden
                      className={cn(
                        'size-4',
                        active ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span className='text-sm font-medium text-foreground'>
                      {label}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {hint}
                    </span>
                  </label>
                );
              })}
            </div>
          </Field>

          <Field label='Rating'>
            <RatingInput
              value={values.rating}
              onChange={n => set('rating', n)}
            />
          </Field>

          <Field
            label={
              values.type === 'TEXT'
                ? 'Review text'
                : isVideo
                  ? 'Caption'
                  : 'Quote'
            }
            htmlFor='content'
            required={values.type === 'TEXT'}
            optional={values.type !== 'TEXT'}
            hint={`${values.content.length}/1000 characters`}
          >
            <Textarea
              id='content'
              rows={values.type === 'TEXT' ? 4 : 2}
              value={values.content}
              onChange={e => set('content', e.target.value)}
              placeholder={
                isVideo
                  ? 'e.g. My one-month skin update'
                  : 'What did the customer say?'
              }
              maxLength={1000}
            />
          </Field>
        </FormSection>

        <FormSection title='Customer' description='Who left the review.'>
          <FieldRow>
            <Field label='Customer name' htmlFor='customerName' required>
              <Input
                id='customerName'
                value={values.customerName}
                onChange={e => set('customerName', e.target.value)}
                placeholder='e.g. Priya S. or @priya.glows'
                maxLength={80}
                required
              />
            </Field>
            <Field label='Location' htmlFor='location' optional>
              <Input
                id='location'
                value={values.location}
                onChange={e => set('location', e.target.value)}
                placeholder='e.g. Kathmandu'
                maxLength={80}
              />
            </Field>
          </FieldRow>
          <Field
            label='Instagram post link'
            htmlFor='instagramUrl'
            optional
            hint='Shown as “View on Instagram” so visitors can see the original post.'
          >
            <Input
              id='instagramUrl'
              type='url'
              value={values.instagramUrl}
              onChange={e => set('instagramUrl', e.target.value)}
              placeholder='https://www.instagram.com/p/…'
            />
          </Field>
        </FormSection>

        {isMedia && (
          <FormSection
            title='Media'
            description={
              isVideo
                ? 'MP4, WebM or MOV, up to 100 MB.'
                : 'JPG, PNG or WebP, up to 10 MB.'
            }
          >
            <Field label={isVideo ? 'Video file' : 'Image'} required>
              {values.mediaUrl ? (
                <div className='relative w-full max-w-[220px] overflow-hidden rounded-lg border bg-black'>
                  {isVideo ? (
                    <video
                      src={values.mediaUrl}
                      poster={values.thumbnailUrl || undefined}
                      controls
                      className='aspect-[9/16] w-full object-contain'
                    />
                  ) : (
                    <img
                      src={values.mediaUrl}
                      alt='Review preview'
                      className='max-h-72 w-full object-contain'
                    />
                  )}
                  <Button
                    type='button'
                    variant='secondary'
                    size='icon-sm'
                    onClick={() =>
                      setValues(prev => ({
                        ...prev,
                        mediaUrl: '',
                        thumbnailUrl: ''
                      }))
                    }
                    className='absolute right-2 top-2 size-7 rounded-full bg-background/90 shadow-sm hover:bg-background'
                    aria-label='Remove media'
                  >
                    <X className='size-3.5' />
                  </Button>
                </div>
              ) : (
                <DropZone
                  label={`Upload ${isVideo ? 'video' : 'image'}`}
                  helper='Click to choose a file or drag it here'
                  uploading={uploading === 'media'}
                  disabled={uploading !== null}
                  onPick={() => mediaInput.current?.click()}
                  onDropFile={file => handleUpload(file, 'media')}
                />
              )}
              <input
                ref={mediaInput}
                type='file'
                hidden
                accept={isVideo ? 'video/*' : 'image/*'}
                onChange={e => {
                  handleUpload(e.target.files?.[0], 'media');
                  e.target.value = '';
                }}
              />
            </Field>

            <Field
              label='File URL'
              htmlFor='mediaUrl'
              hint='Or paste a direct link to the file instead of uploading.'
            >
              <Input
                id='mediaUrl'
                value={values.mediaUrl}
                onChange={e => set('mediaUrl', e.target.value)}
                placeholder='https://ik.imagekit.io/…'
              />
            </Field>

            {isVideo && (
              <Field
                label='Cover image'
                htmlFor='thumbnailUrl'
                optional
                hint='Generated automatically for uploaded videos.'
              >
                <div className='flex gap-2'>
                  <Input
                    id='thumbnailUrl'
                    value={values.thumbnailUrl}
                    onChange={e => set('thumbnailUrl', e.target.value)}
                    placeholder='https://…'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0'
                    disabled={uploading !== null}
                    onClick={() => thumbInput.current?.click()}
                    aria-label='Upload cover image'
                  >
                    {uploading === 'thumbnail' ? (
                      <Loader2 className='animate-spin' />
                    ) : (
                      <Upload />
                    )}
                  </Button>
                </div>
                <input
                  ref={thumbInput}
                  type='file'
                  hidden
                  accept='image/*'
                  onChange={e => {
                    handleUpload(e.target.files?.[0], 'thumbnail');
                    e.target.value = '';
                  }}
                />
              </Field>
            )}
          </FormSection>
        )}

        <FormSection
          title='Display'
          description='Where and how the review shows on the website.'
        >
          <FieldRow>
            <Field label='Product' optional>
              <Select
                value={values.productId || NO_PRODUCT}
                onValueChange={v => set('productId', v === NO_PRODUCT ? '' : v)}
              >
                <SelectTrigger className='w-full' aria-label='Product'>
                  <SelectValue placeholder='Not linked to a product' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={NO_PRODUCT}>
                      Not linked to a product (shows in “From our DMs”)
                    </SelectItem>
                    {products.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field
              label='Sort order'
              htmlFor='sortOrder'
              hint='Lower numbers appear first.'
            >
              <Input
                id='sortOrder'
                type='number'
                step={1}
                value={values.sortOrder}
                onChange={e => set('sortOrder', Number(e.target.value) || 0)}
              />
            </Field>
          </FieldRow>
          <SwitchField
            label='Published'
            description='Visible on the website.'
            checked={values.isPublished}
            onCheckedChange={v => set('isPublished', v)}
          />
          <SwitchField
            label='Featured'
            description='Shown first, including on the home page.'
            checked={values.isFeatured}
            onCheckedChange={v => set('isFeatured', v)}
          />
        </FormSection>
      </FormBody>

      <FormFooter>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={submitting || uploading !== null}>
          {submitting && <Loader2 className='animate-spin' />}
          {submitLabel}
        </Button>
      </FormFooter>
    </form>
  );
}
