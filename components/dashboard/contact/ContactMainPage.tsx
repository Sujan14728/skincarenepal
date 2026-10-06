'use client';

import { Building2, Inbox } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/dashboard/PageHeader';
import CompanyInfoForm from './CompanyInfoForm';
import ContactList from './ContactList';

export default function ContactMainPage() {
  return (
    <div className='flex flex-col'>
      <PageHeader
        title='Messages'
        description='Customer messages from the contact form, and the contact details shown on the website.'
      />
      <Tabs defaultValue='contacts' className='gap-4'>
        <TabsList className='w-full sm:w-fit'>
          <TabsTrigger value='contacts' className='px-3'>
            <Inbox />
            Inbox
          </TabsTrigger>
          <TabsTrigger value='info' className='px-3'>
            <Building2 />
            Contact details
          </TabsTrigger>
        </TabsList>

        <TabsContent value='contacts'>
          <ContactList />
        </TabsContent>

        <TabsContent value='info'>
          <CompanyInfoForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
