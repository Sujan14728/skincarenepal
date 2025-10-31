'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type CompanyInfo = {
  id?: number;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyLocation?: string | null;
};

export default function CompanyInfoForm() {
  const [form, setForm] = useState<CompanyInfo>({
    companyEmail: '',
    companyPhone: '',
    companyLocation: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      const res = await fetch('/api/companyinfo');
      const data = await res.json();
      if (data?.success && data.companyInfo) {
        setForm({
          companyEmail: data.companyInfo.companyEmails?.join(', ') || '',
          companyPhone: data.companyInfo.companyPhones?.join(', ') || '',
          companyLocation: data.companyInfo.companyLocation || ''
        });
      }
    };
    fetchInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body: any = {};

      if (form.companyEmail && form.companyEmail.trim() !== '') {
        body.companyEmails = form.companyEmail.split(',').map(e => e.trim());
      }

      if (form.companyPhone && form.companyPhone.trim() !== '') {
        body.companyPhones = form.companyPhone.split(',').map(p => p.trim());
      }

      if (form.companyLocation && form.companyLocation.trim() !== '') {
        body.companyLocation = form.companyLocation.trim();
      }

      if (Object.keys(body).length === 0) {
        toast.error('No data to update');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/companyinfo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Company info updated');

        // Reset form fields to empty
        setForm({
          companyEmail: '',
          companyPhone: '',
          companyLocation: ''
        });
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rounded-2xl bg-white p-6 shadow-md'>
      <h2 className='mb-4 text-xl font-semibold'>Company Information</h2>
      <div className='space-y-3'>
        <div>
          <Label>Email</Label>
          <Input
            name='companyEmail'
            value={form.companyEmail || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            name='companyPhone'
            value={form.companyPhone || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Location</Label>
          <Input
            name='companyLocation'
            value={form.companyLocation || ''}
            onChange={handleChange}
          />
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
