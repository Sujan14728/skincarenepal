'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface SettingsData {
  globalDiscountPercent: number;
  freeShippingThreshold: number;
  qrImageUrl?: string;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsData>({
    globalDiscountPercent: 25,
    freeShippingThreshold: 3000,
    qrImageUrl: ''
  });
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
          setSettings(data);
          setPreviewUrl(data.qrImageUrl || '');
        }
      });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
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
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', 'settings/qr-codes');
      formData.append('useUniqueFileName', 'true');
      formData.append('tags', 'qr-code,settings');

      // Upload to ImageKit
      const uploadRes = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadData = await uploadRes.json();

      // Update settings with new QR image URL
      setSettings({
        ...settings,
        qrImageUrl: uploadData.url
      });

      setPreviewUrl(uploadData.url);
      setSelectedFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('QR image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSettings({ ...settings, qrImageUrl: '' });
    setPreviewUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      setLoading(false);

      if (res.ok) {
        toast.success('Settings updated successfully');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Server error');
      console.error(err);
    }
  };

  return (
    <Card className='mx-auto max-w-lg'>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='discount'>Global Discount (%)</Label>
          <Input
            id='discount'
            type='number'
            value={settings.globalDiscountPercent}
            onChange={e =>
              setSettings({
                ...settings,
                globalDiscountPercent: parseInt(e.target.value, 10)
              })
            }
          />
        </div>

        <div>
          <Label htmlFor='freeShipping'>Free Shipping Threshold (Rs)</Label>
          <Input
            id='freeShipping'
            type='number'
            value={settings.freeShippingThreshold}
            onChange={e =>
              setSettings({
                ...settings,
                freeShippingThreshold: parseInt(e.target.value, 10)
              })
            }
          />
        </div>

        <div>
          <Label htmlFor='qrImage'>Payment QR Code</Label>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileSelect}
            className='hidden'
            id='qr-file-input'
          />

          {/* Upload Area */}
          <div className='space-y-2'>
            <div
              onClick={() => fileInputRef.current?.click()}
              className='cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-400'
            >
              <Upload className='mx-auto mb-2 h-8 w-8 text-gray-400' />
              <p className='text-sm text-gray-600'>
                {selectedFile
                  ? selectedFile.name
                  : 'Click to select QR code image'}
              </p>
              <p className='mt-1 text-xs text-gray-400'>PNG, JPG up to 5MB</p>
            </div>

            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className='w-full'
                variant='outline'
              >
                {uploading ? 'Uploading...' : 'Upload QR Image'}
              </Button>
            )}
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className='mt-3'>
              <div className='relative inline-block'>
                <Image
                  height={128}
                  width={128}
                  src={previewUrl}
                  alt='QR Code Preview'
                  className='h-32 w-32 rounded-lg border object-cover'
                />
                <Button
                  onClick={handleRemoveImage}
                  size='sm'
                  variant='destructive'
                  className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0'
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>
              <p className='mt-1 text-xs text-gray-500'>Current QR Code</p>
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={loading} className='w-full'>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
