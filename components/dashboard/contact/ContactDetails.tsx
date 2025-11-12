'use client';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm'>
      <div className='animate-in fade-in-0 zoom-in-95 relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl'>
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-gray-400 transition hover:text-gray-600'
        >
          <X className='h-5 w-5' />
        </button>

        {/* Header */}
        <div className='mb-4 space-y-1'>
          <h3 className='text-lg font-semibold text-gray-900'>
            {contact.name}
          </h3>
          <p className='text-sm text-gray-500'>{contact.email}</p>
        </div>

        {/* Subject + Status */}
        <div className='mb-3 flex items-center justify-between'>
          <p className='text-sm font-medium text-gray-800'>{contact.subject}</p>
          <Badge
            variant={
              contact.status === 'resolved'
                ? 'success'
                : contact.status === 'pending'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {contact.status}
          </Badge>
        </div>

        {/* Message */}
        <div className='mb-4 max-h-60 overflow-y-auto rounded-xl bg-gray-50 p-4'>
          <p className='whitespace-pre-wrap text-sm leading-relaxed text-gray-700'>
            {contact.message}
          </p>
        </div>

        {/* Date */}
        <p className='mb-5 text-right text-xs text-gray-400'>
          {new Date(contact.createdAt).toLocaleString()}
        </p>

        {/* Actions */}
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete message?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The message will be permanently
                  deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
