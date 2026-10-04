'use client';

import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

/**
 * Right-hand drawer for create/edit forms. The child should be a <form>
 * using FormBody + FormFooter so the body scrolls and actions stay visible.
 */
export default function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children
}: {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  title: string;
  description?: string;
  size?: 'md' | 'lg';
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className={cn(
          'flex w-full flex-col gap-0 p-0',
          size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-xl'
        )}
      >
        <SheetHeader className='shrink-0 border-b px-6 py-5 pr-12'>
          <SheetTitle className='text-lg'>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : (
            <SheetDescription className='sr-only'>{title}</SheetDescription>
          )}
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
