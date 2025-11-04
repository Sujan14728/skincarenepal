// components/landing/partial/ProductCardSkeleton.tsx

export function ProductCardSkeleton() {
  return (
    <div className='bg-card flex flex-col overflow-hidden rounded-xl shadow-md'>
      {/* Image Skeleton */}
      <div className='bg-muted relative aspect-[4/3] w-full' />

      {/* Content */}
      <div className='flex flex-grow flex-col p-4'>
        {/* Title */}
        <div className='bg-muted mb-4 h-6 w-3/4 rounded'></div>

        {/* Excerpt (2 lines) */}
        <div className='mb-4 flex-grow space-y-1'>
          <div className='bg-muted h-4 w-full rounded'></div>
          <div className='bg-muted h-4 w-5/6 rounded'></div>
        </div>

        {/* Price + Button Row */}
        <div className='mt-auto flex items-center justify-between pt-4'>
          <div className='flex flex-col space-y-1'>
            <div className='bg-muted h-5 w-20 rounded'></div>
            <div className='bg-muted h-3 w-16 rounded'></div>
          </div>
          <div className='bg-muted h-9 w-20 rounded-lg'></div>
        </div>
      </div>
    </div>
  );
}
