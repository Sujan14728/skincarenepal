'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyInfoForm from './CompanyInfoForm';
import ContactList from './ContactList';

export default function ContactMainPage() {
  return (
    <div className='space-y-6 p-6'>
      <Tabs defaultValue='info' className='w-full'>
        <TabsList className='flex gap-2'>
          <TabsTrigger value='info' className='flex-1'>
            Company Info
          </TabsTrigger>
          <TabsTrigger value='contacts' className='flex-1'>
            Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value='info'>
          <CompanyInfoForm />
        </TabsContent>

        <TabsContent value='contacts'>
          <ContactList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
