import { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/** Centered placeholder for empty lists and tables. */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 px-6 py-12 text-center'>
      <span className='grid size-12 place-items-center rounded-full bg-muted text-muted-foreground'>
        <Icon className='size-5' aria-hidden />
      </span>
      <div className='flex flex-col gap-1'>
        <p className='text-sm font-medium text-foreground'>{title}</p>
        {description && (
          <p className='max-w-sm text-sm text-muted-foreground'>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
