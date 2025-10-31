'use client';
import { useState } from 'react';
import CompanyInfoForm from './CompanyInfoForm';
import ContactList from './ContactList';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [active, setActive] = useState<'info' | 'contacts'>('info');

  return (
    <div className='space-y-6 p-6'>
      <div className='flex gap-4'>
        <Button
          onClick={() => setActive('info')}
          variant={active === 'info' ? 'default' : 'outline'}
        >
          Company Info
        </Button>
        <Button
          onClick={() => setActive('contacts')}
          variant={active === 'contacts' ? 'default' : 'outline'}
        >
          Contacts
        </Button>
      </div>

      {active === 'info' && <CompanyInfoForm />}
      {active === 'contacts' && <ContactList />}
    </div>
  );
}
