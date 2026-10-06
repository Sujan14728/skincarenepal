'use client';

import {
  Archive,
  ArchiveRestore,
  CheckCheck,
  Loader2,
  Mail,
  MailOpen,
  Phone,
  Reply,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmDelete from '@/components/dashboard/ConfirmDelete';
import { formatDateTime } from '@/components/dashboard/format';

export type ContactStatus = 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED';

export type Contact = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
};

export const STATUS_META: Record<
  ContactStatus,
  { label: string; variant: 'blue' | 'secondary' | 'success' | 'outline' }
> = {
  UNREAD: { label: 'Unread', variant: 'blue' },
  READ: { label: 'Read', variant: 'secondary' },
  REPLIED: { label: 'Replied', variant: 'success' },
  ARCHIVED: { label: 'Archived', variant: 'outline' }
};

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.READ;
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

type Props = {
  contact: Contact;
  updating: boolean;
  onStatusChange: (_status: ContactStatus) => void;
  onDelete: () => void;
};

/** Reading pane for one message: sender, body and status actions. */
export function ContactDetails({
  contact,
  updating,
  onStatusChange,
  onDelete
}: Props) {
  const replyHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    `Re: ${contact.subject}`
  )}`;

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6'>
        {/* Subject */}
        <div className='flex flex-col gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <ContactStatusBadge status={contact.status} />
            <span className='text-xs text-muted-foreground'>
              {formatDateTime(contact.createdAt)}
            </span>
          </div>
          <h2 className='text-lg font-semibold leading-snug text-foreground'>
            {contact.subject}
          </h2>
        </div>

        {/* Sender */}
        <div className='flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex min-w-0 items-center gap-3'>
            <span className='grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground'>
              {initials(contact.name)}
            </span>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium text-foreground'>
                {contact.name}
              </p>
              <p className='truncate text-sm text-muted-foreground'>
                {contact.email}
                {contact.phone ? ` · ${contact.phone}` : ''}
              </p>
            </div>
          </div>
          <div className='flex shrink-0 gap-2'>
            <Button variant='outline' size='sm' asChild>
              <a href={`mailto:${contact.email}`}>
                <Mail />
                Email
              </a>
            </Button>
            {contact.phone && (
              <Button variant='outline' size='sm' asChild>
                <a href={`tel:${contact.phone}`}>
                  <Phone />
                  Call
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Message */}
        <p className='whitespace-pre-wrap text-sm leading-relaxed text-foreground'>
          {contact.message}
        </p>
      </div>

      {/* Actions */}
      <div className='flex shrink-0 flex-wrap items-center gap-2 border-t bg-background px-6 py-4'>
        <Button asChild>
          <a href={replyHref}>
            <Reply />
            Reply by email
          </a>
        </Button>

        {contact.status !== 'REPLIED' && (
          <Button
            variant='outline'
            disabled={updating}
            onClick={() => onStatusChange('REPLIED')}
          >
            <CheckCheck />
            Mark as replied
          </Button>
        )}
        {contact.status === 'UNREAD' ? (
          <Button
            variant='outline'
            disabled={updating}
            onClick={() => onStatusChange('READ')}
          >
            <MailOpen />
            Mark as read
          </Button>
        ) : (
          contact.status !== 'ARCHIVED' && (
            <Button
              variant='ghost'
              disabled={updating}
              onClick={() => onStatusChange('UNREAD')}
            >
              <Mail />
              Mark as unread
            </Button>
          )
        )}

        <div className='ml-auto flex items-center gap-1'>
          {updating && (
            <Loader2
              className='size-4 animate-spin text-muted-foreground'
              aria-label='Updating status'
            />
          )}
          {contact.status === 'ARCHIVED' ? (
            <Button
              variant='ghost'
              size='icon-sm'
              disabled={updating}
              onClick={() => onStatusChange('READ')}
              aria-label='Move to inbox'
              title='Move to inbox'
            >
              <ArchiveRestore />
            </Button>
          ) : (
            <Button
              variant='ghost'
              size='icon-sm'
              disabled={updating}
              onClick={() => onStatusChange('ARCHIVED')}
              aria-label='Archive message'
              title='Archive'
            >
              <Archive />
            </Button>
          )}
          <ConfirmDelete
            title='Delete message?'
            description='This permanently deletes the message. It cannot be undone.'
            confirmLabel='Delete message'
            onConfirm={onDelete}
          >
            <Button
              variant='ghost'
              size='icon-sm'
              className='text-muted-foreground hover:text-destructive'
              aria-label='Delete message'
              title='Delete'
            >
              <Trash2 />
            </Button>
          </ConfirmDelete>
        </div>
      </div>
    </div>
  );
}
