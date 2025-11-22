// components/Hero.tsx
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className='bg-accent py-16 md:py-24'>
      <div className='mx-auto flex flex-col-reverse items-center justify-between gap-10 px-4 sm:px-6 md:flex-row lg:px-8'>
        <div className='mb-10 w-full space-y-6 lg:mb-0 lg:w-1/2'>
          <h1 className='text-center text-3xl font-extrabold leading-tight text-foreground md:text-left md:text-4xl lg:text-5xl'>
            CARE FROM NATURE,
            <br />
            <span className='text-primary'>CLEAN BY CHOICE</span>
          </h1>

          <p className='mx-auto max-w-md text-center text-lg text-muted-foreground md:mx-0 md:text-left'>
            Embrace nature’s care with Care and Clean, Nepal’s trusted natural
            skincare brand for all skin types.
          </p>

          <div className='flex justify-center space-x-4 pt-4 md:justify-start'>
            <Link
              href='/products'
              className='hover:bg-primary/90 inline-flex items-center justify-center rounded-full border border-transparent bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-sm transition-colors'
            >
              Shop Now
            </Link>

            <Link
              href='/about'
              className='inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary'
            >
              Learn About
            </Link>
          </div>
        </div>

        <div className='flex w-full justify-center lg:w-1/2 lg:justify-end'>
          <div className='relative h-[360px] w-full overflow-hidden rounded-[1.8rem] lg:h-[480px] lg:w-[780px]'>
            <Image
              src='/images/products/facepack.jpg'
              alt='Natural organic face pack from Care and Clean Nepal'
              fill
              sizes='(min-width: 1024px) 50vw, 100vw'
              fetchPriority='high'
              className='object-cover'
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
