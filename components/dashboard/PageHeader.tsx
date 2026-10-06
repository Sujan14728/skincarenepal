import { ReactNode } from 'react';

/** Consistent title row for every admin page. */
export default function PageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div className='flex flex-col gap-1'>
        <h1 className='font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]'>
          {title}
        </h1>
        {description && (
          <p className='max-w-prose text-sm text-muted-foreground'>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          {actions}
        </div>
      )}
    </div>
  );
}
