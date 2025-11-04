'use client';
import { Button } from '@/components/ui/button';

type Props = {
  contact: {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
  };
  onClose: () => void;
  onDelete: () => void;
};

export function ContactDetails({ contact, onClose, onDelete }: Props) {
  return (
    <div className='fixed inset-0 flex items-center justify-center backdrop-blur-sm'>
      <div className='w-96 rounded-xl bg-white p-6 shadow-lg'>
        <h3 className='mb-2 text-lg font-semibold'>{contact.name}</h3>
        <p className='mb-1 text-sm'>
          <strong>Email:</strong> {contact.email}
        </p>
        <p className='mb-1 text-sm'>
          <strong>Subject:</strong> {contact.subject}
        </p>
        <p className='mb-2 text-sm'>
          <strong>Message:</strong> {contact.message}
        </p>
        <p className='mb-4 text-xs text-gray-500'>
          <strong>Status:</strong> {contact.status}
        </p>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
          <Button variant='destructive' onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
