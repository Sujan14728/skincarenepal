import { ReactNode } from 'react';
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

function LeafMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-10 place-items-center rounded-xl bg-pine-accent text-pine shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)]',
        className
      )}
    >
      <Leaf className='size-5' strokeWidth={2.25} aria-hidden />
    </span>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className='admin-theme grid min-h-screen bg-canvas text-foreground lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]'>
      {/* Brand panel */}
      <aside className='admin-contours relative hidden flex-col justify-between overflow-hidden bg-pine p-10 text-pine-foreground lg:flex xl:p-14'>
        <div className='flex items-center gap-3'>
          <LeafMark />
          <span className='text-sm font-medium text-pine-muted'>
            Store admin · Nepal
          </span>
        </div>

        <div className='flex max-w-md flex-col gap-5'>
          <h1 className='font-display text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl'>
            Care &amp; Clean
          </h1>
          <p className='text-base leading-relaxed text-pine-foreground/75'>
            Orders, products and customer messages for your skincare store, all
            in one calm place.
          </p>
        </div>

        <p className='flex items-center gap-2 text-xs text-pine-muted'>
          <span className='size-1.5 rounded-full bg-pine-accent' aria-hidden />
          Authorised staff only
        </p>
      </aside>

      {/* Form */}
      <main className='flex flex-col items-center justify-center px-4 py-12 sm:px-8'>
        <div className='flex w-full max-w-sm flex-col gap-8'>
          <div className='flex items-center gap-3 lg:hidden'>
            <LeafMark />
            <span className='font-display text-lg font-semibold tracking-tight text-foreground'>
              Care &amp; Clean
            </span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
