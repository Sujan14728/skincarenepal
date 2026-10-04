'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, QrCode, Truck, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/dashboard/PageHeader';
import { Field, FieldRow, FormFooter } from '@/components/dashboard/form';
import { formatNPR } from '@/components/dashboard/format';
import { cn } from '@/lib/utils';

interface SettingsData {
  deliveryCost: number;
  freeShippingThreshold: number;
  qrImageUrl?: string;
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className='overflow-hidden rounded-xl border bg-card shadow-xs'>
      <header className='flex items-start gap-3 border-b px-6 py-5'>
        <span className='grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground'>
          <Icon className='size-4' aria-hidden />
        </span>
        <div className='flex flex-col gap-0.5'>
          <h2 className='text-base font-semibold text-foreground'>{title}</h2>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function MoneyInput({
  id,
  value,
  onChange,
  disabled
}: {
  id: string;
  value: number;
  onChange: (_value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className='relative'>
      <span
        className='pointer-events-none absolute inset-y-0 left-0 flex items-center border-r px-3 text-sm text-muted-foreground'
        aria-hidden
      >
        Rs.
      </span>
      <Input
        id={id}
        type='number'
        inputMode='numeric'
        min={0}
        value={Number.isNaN(value) ? '' : value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className='pl-14 tabular-nums'
      />
    </div>
  );
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsData>({
    deliveryCost: 0,
    freeShippingThreshold: 3000,
    qrImageUrl: ''
  });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          // backward-compatible mapping:
          // if backend still returns globalDiscountPercent, map it to deliveryCost fallback
          setSettings({
            deliveryCost:
              typeof data.deliveryCost === 'number'
                ? data.deliveryCost
                : typeof data.globalDiscountPercent === 'number'
                  ? data.globalDiscountPercent
                  : 0,
            freeShippingThreshold: data.freeShippingThreshold ?? 3000,
            qrImageUrl: data.qrImageUrl || ''
          });
          setPreviewUrl(data.qrImageUrl || '');
        }
      })
      .catch(err => {
        console.error('Failed to load settings', err);
      })
      .finally(() => setReady(true));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = e => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', 'settings/qr-codes');
      formData.append('useUniqueFileName', 'true');
      formData.append('tags', 'qr-code,settings');

      const uploadRes = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadData = await uploadRes.json();

      const updatedSettings = {
        ...settings,
        qrImageUrl: uploadData.url
      };
      setSettings(updatedSettings);

      // Auto-save to database immediately after upload
      const saveRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save QR image URL to database');
      }

      setPreviewUrl(uploadData.url);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Payment QR code saved');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const updatedSettings = { ...settings, qrImageUrl: '' };
    setSettings(updatedSettings);
    setPreviewUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Auto-save to database after removing QR
    try {
      const saveRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });

      if (saveRes.ok) {
        toast.success('Payment QR code removed');
      } else {
        toast.error('Failed to remove QR image from database');
      }
    } catch (err) {
      console.error('Error removing QR:', err);
      toast.error('Failed to remove QR image');
    }
  };

  /** Discards a picked-but-not-uploaded file and restores the saved QR. */
  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(settings.qrImageUrl || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      setLoading(false);

      if (res.ok) {
        toast.success('Shipping settings saved');
      } else {
        toast.error('Failed to save settings. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Server error');
      console.error(err);
    }
  };

  const { deliveryCost, freeShippingThreshold } = settings;
  const validAmounts =
    Number.isFinite(deliveryCost) && Number.isFinite(freeShippingThreshold);

  return (
    <div className='flex flex-col'>
      <PageHeader
        title='Settings'
        description='Delivery charges and the payment QR code shown at checkout.'
      />

      <div className='flex max-w-3xl flex-col gap-6'>
        {/* Shipping */}
        <SettingsCard
          icon={Truck}
          title='Shipping'
          description='How much customers pay for delivery at checkout.'
        >
          <form onSubmit={handleSave}>
            <div className='flex flex-col gap-5 p-6'>
              <FieldRow>
                <Field
                  label='Delivery cost'
                  htmlFor='deliveryCost'
                  hint='Added to every order below the free shipping amount. Use 0 to charge nothing.'
                >
                  {ready ? (
                    <MoneyInput
                      id='deliveryCost'
                      value={deliveryCost}
                      onChange={value =>
                        setSettings({
                          ...settings,
                          deliveryCost: parseInt(value || '0', 10)
                        })
                      }
                    />
                  ) : (
                    <Skeleton className='h-9 w-full' />
                  )}
                </Field>
                <Field
                  label='Free shipping from'
                  htmlFor='freeShipping'
                  hint='Orders with a subtotal at or above this amount ship free.'
                >
                  {ready ? (
                    <MoneyInput
                      id='freeShipping'
                      value={freeShippingThreshold}
                      onChange={value =>
                        setSettings({
                          ...settings,
                          freeShippingThreshold: parseInt(value, 10)
                        })
                      }
                    />
                  ) : (
                    <Skeleton className='h-9 w-full' />
                  )}
                </Field>
              </FieldRow>

              {ready && validAmounts && (
                <div className='flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
                  <Truck className='mt-0.5 size-4 shrink-0' aria-hidden />
                  <p>
                    At checkout, orders under{' '}
                    <span className='font-medium text-foreground'>
                      {formatNPR(freeShippingThreshold)}
                    </span>{' '}
                    pay{' '}
                    <span className='font-medium text-foreground'>
                      {deliveryCost > 0 ? formatNPR(deliveryCost) : 'nothing'}
                    </span>{' '}
                    for delivery; orders of{' '}
                    <span className='font-medium text-foreground'>
                      {formatNPR(freeShippingThreshold)}
                    </span>{' '}
                    or more ship free.
                  </p>
                </div>
              )}
            </div>
            <FormFooter>
              <Button type='submit' disabled={loading || !ready}>
                {loading && <Loader2 className='animate-spin' />}
                Save changes
              </Button>
            </FormFooter>
          </form>
        </SettingsCard>

        {/* Payments */}
        <SettingsCard
          icon={QrCode}
          title='Payments'
          description='The QR code customers scan to pay for their order.'
        >
          <div className='flex flex-col gap-6 p-6 sm:flex-row sm:items-start'>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleFileSelect}
              className='hidden'
              id='qr-file-input'
            />

            {!ready ? (
              <Skeleton className='size-44 shrink-0 rounded-xl' />
            ) : previewUrl ? (
              <div className='relative size-44 shrink-0'>
                <Image
                  height={176}
                  width={176}
                  src={previewUrl}
                  alt='Payment QR code preview'
                  className={cn(
                    'size-44 rounded-xl border bg-white object-contain p-2',
                    uploading && 'opacity-60'
                  )}
                />
                {uploading && (
                  <span className='absolute inset-0 grid place-items-center'>
                    <Loader2 className='size-6 animate-spin text-primary' />
                  </span>
                )}
                {!selectedFile && (
                  <Button
                    type='button'
                    onClick={handleRemoveImage}
                    size='icon-sm'
                    variant='outline'
                    className='absolute -right-2 -top-2 size-7 rounded-full bg-background shadow-xs hover:text-destructive'
                    aria-label='Remove payment QR code'
                  >
                    <X className='size-3.5' />
                  </Button>
                )}
              </div>
            ) : (
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='flex size-44 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center outline-none transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50'
              >
                <span className='grid size-10 place-items-center rounded-full bg-accent text-accent-foreground'>
                  <Upload className='size-4' aria-hidden />
                </span>
                <span className='text-sm font-medium text-foreground'>
                  Upload QR code
                </span>
                <span className='text-xs text-muted-foreground'>
                  PNG or JPG, up to 5MB
                </span>
              </button>
            )}

            <div className='flex flex-1 flex-col gap-3'>
              <div className='flex flex-col gap-1'>
                <p className='text-sm font-medium text-foreground'>
                  Payment QR code
                </p>
                <p className='text-sm text-muted-foreground'>
                  Shown in the payment step at checkout; customers can tap it to
                  enlarge. Use a clear, square image of your merchant QR so it
                  scans easily from a phone.
                </p>
              </div>

              {selectedFile ? (
                <div className='flex flex-col gap-3'>
                  <p className='truncate text-xs text-muted-foreground'>
                    Selected: {selectedFile.name}
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      type='button'
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className='animate-spin' />
                      ) : (
                        <Upload />
                      )}
                      {uploading ? 'Uploading…' : 'Upload and save'}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={cancelSelection}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                ready &&
                previewUrl && (
                  <Button
                    type='button'
                    variant='outline'
                    className='w-fit'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload />
                    Replace image
                  </Button>
                )
              )}
              <p className='text-xs text-muted-foreground'>
                QR changes save as soon as they are uploaded or removed.
              </p>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
};

export default SettingsPage;
