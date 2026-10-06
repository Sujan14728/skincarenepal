'use client';

import { ReactNode, useId } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

/**
 * Admin form building blocks. Every module form composes these so labels,
 * hints, spacing and the action bar look identical across the dashboard.
 *
 *   <form className='flex min-h-0 flex-1 flex-col'>
 *     <FormBody>
 *       <FormSection title='Basics' description='…'>
 *         <Field label='Name' htmlFor='name' required><Input id='name' /></Field>
 *       </FormSection>
 *     </FormBody>
 *     <FormFooter>…buttons…</FormFooter>
 *   </form>
 */

/** Scrollable form content (pairs with FormFooter inside a FormSheet). */
export function FormBody({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-6 py-6',
        className
      )}
    >
      {children}
    </div>
  );
}

/** Action bar pinned to the bottom of a form: secondary left of primary. */
export function FormFooter({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col-reverse gap-2 border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-end',
        className
      )}
    >
      {children}
    </div>
  );
}

/** A titled group of related fields. */
export function FormSection({
  title,
  description,
  action,
  className,
  children
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('flex flex-col gap-5', className)}>
      <div className='flex items-start justify-between gap-4 border-b pb-3'>
        <div className='flex flex-col gap-1'>
          <h3 className='text-sm font-semibold text-foreground'>{title}</h3>
          {description && (
            <p className='text-sm text-muted-foreground'>{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className='flex flex-col gap-5'>{children}</div>
    </section>
  );
}

/** Label + control + hint/error, stacked. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  className,
  children
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-invalid={error ? true : undefined}
      className={cn('flex flex-col gap-2', className)}
    >
      <Label htmlFor={htmlFor} className='text-foreground'>
        {label}
        {required && (
          <span className='text-destructive' aria-hidden>
            *
          </span>
        )}
        {optional && (
          <span className='font-normal text-muted-foreground'>(optional)</span>
        )}
      </Label>
      {children}
      {error ? (
        <p className='text-xs font-medium text-destructive' role='alert'>
          {error}
        </p>
      ) : (
        hint && <p className='text-xs text-muted-foreground'>{hint}</p>
      )}
    </div>
  );
}

/** Puts 2–3 short fields side by side on wider screens. */
export function FieldRow({
  cols = 2,
  className,
  children
}: {
  cols?: 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid gap-5',
        cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
        className
      )}
    >
      {children}
    </div>
  );
}

/** A boolean setting presented as a labelled row with a switch. */
export function SwitchField({
  label,
  description,
  checked,
  onCheckedChange,
  disabled
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (_checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className='flex items-start justify-between gap-4 rounded-lg border p-4'>
      <div className='flex flex-col gap-1'>
        <Label htmlFor={id} className='text-foreground'>
          {label}
        </Label>
        {description && (
          <p className='text-xs text-muted-foreground'>{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

/** Editable list of short strings (benefits, steps, ingredients…). */
export function ListField({
  label,
  hint,
  items,
  onChange,
  placeholder,
  addLabel = 'Add item',
  numbered
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (_items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  numbered?: boolean;
}) {
  const update = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) =>
    onChange(items.filter((_, i) => i !== index));

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-baseline justify-between gap-2'>
        <Label className='text-foreground'>{label}</Label>
        <span className='text-xs text-muted-foreground'>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      {items.length > 0 && (
        <ul className='flex flex-col gap-2'>
          {items.map((item, index) => (
            <li key={index} className='flex items-center gap-2'>
              {numbered ? (
                <span className='grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground'>
                  {index + 1}
                </span>
              ) : (
                <span className='mx-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/40' aria-hidden />
              )}
              <Input
                value={item}
                onChange={e => update(index, e.target.value)}
                placeholder={placeholder}
                aria-label={`${label} ${index + 1}`}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='shrink-0 text-muted-foreground hover:text-destructive'
                onClick={() => remove(index)}
                aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='w-fit'
        onClick={() => onChange([...items, ''])}
      >
        <Plus />
        {addLabel}
      </Button>
      {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
    </div>
  );
}
