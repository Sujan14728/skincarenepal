'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Field,
  FormFooter,
  FormSection,
  ListField
} from '@/components/dashboard/form';

type FormState = {
  companyEmails: string[];
  companyPhones: string[];
  companyLocation: string;
};

type CompanyInfoBody = {
  companyEmails?: string[];
  companyPhones?: string[];
  companyLocation?: string;
};

const clean = (items: string[]) =>
  items.map(item => item.trim()).filter(Boolean);

export default function CompanyInfoForm() {
  const [form, setForm] = useState<FormState>({
    companyEmails: [],
    companyPhones: [],
    companyLocation: ''
  });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch('/api/companyinfo');
        const data = await res.json();
        if (data?.success && data.companyInfo) {
          setForm({
            companyEmails: data.companyInfo.companyEmails ?? [],
            companyPhones: data.companyInfo.companyPhones ?? [],
            companyLocation: data.companyInfo.companyLocation || ''
          });
        }
      } catch {
        // Nothing saved yet or offline: start from an empty form.
      } finally {
        setReady(true);
      }
    };
    fetchInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body: CompanyInfoBody = {};
      const emails = clean(form.companyEmails);
      const phones = clean(form.companyPhones);

      if (emails.length > 0) body.companyEmails = emails;
      if (phones.length > 0) body.companyPhones = phones;
      if (form.companyLocation.trim() !== '') {
        body.companyLocation = form.companyLocation.trim();
      }

      if (Object.keys(body).length === 0) {
        toast.error('Add at least one detail before saving');
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
        toast.success('Contact details saved');
        setForm(prev => ({
          ...prev,
          companyEmails: emails,
          companyPhones: phones
        }));
      } else {
        toast.error(data.error || 'Failed to save contact details');
      }
    } catch {
      toast.error('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex max-w-3xl flex-col overflow-hidden rounded-xl border bg-card shadow-xs'
    >
      <div className='flex flex-col gap-8 p-6'>
        {!ready ? (
          <div className='flex flex-col gap-4'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-9 w-full' />
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-9 w-full' />
            <Skeleton className='h-9 w-2/3' />
          </div>
        ) : (
          <>
            <FormSection
              title='Address'
              description='Shown on the contact page and in the site footer.'
            >
              <Field
                label='Location'
                htmlFor='companyLocation'
                hint='e.g. New Road, Kathmandu, Nepal'
              >
                <Input
                  id='companyLocation'
                  value={form.companyLocation}
                  onChange={e =>
                    setForm({ ...form, companyLocation: e.target.value })
                  }
                  placeholder='Street, city'
                />
              </Field>
            </FormSection>

            <FormSection
              title='Email and phone'
              description='How customers reach you from the website.'
            >
              <ListField
                label='Email addresses'
                items={form.companyEmails}
                onChange={companyEmails => setForm({ ...form, companyEmails })}
                placeholder='hello@example.com'
                addLabel='Add email'
              />
              <ListField
                label='Phone numbers'
                items={form.companyPhones}
                onChange={companyPhones => setForm({ ...form, companyPhones })}
                placeholder='+977 98XXXXXXXX'
                addLabel='Add phone'
              />
            </FormSection>
          </>
        )}
      </div>
      <FormFooter>
        <Button type='submit' disabled={loading || !ready}>
          {loading && <Loader2 className='animate-spin' />}
          Save changes
        </Button>
      </FormFooter>
    </form>
  );
}
