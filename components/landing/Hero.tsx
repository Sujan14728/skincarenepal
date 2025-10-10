// components/Hero.tsx
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className='bg-accent py-16 md:py-24'>
      <div className='mx-auto flex flex-col-reverse items-center justify-between gap-10 px-4 sm:px-6 md:flex-row lg:px-8'>
        <div className='mb-10 w-full space-y-6 lg:mb-0 lg:w-1/2'>
          <h1 className='text-foreground text-center text-4xl leading-tight font-extrabold sm:text-5xl md:text-left lg:text-6xl'>
            Natural Beauty
            <br />
            <span className='text-primary'>From the Himalayas</span>
          </h1>

          <p className='text-muted-foreground mx-auto max-w-md text-center text-lg md:mx-0 md:text-left'>
            Discover the power of nature with our premium organic skincare
            products, crafted with love in Nepal.
          </p>

          <div className='flex justify-center space-x-4 pt-4 md:justify-start'>
            <Link href='/products'>
              <span className='text-primary-foreground bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-full border border-transparent px-8 py-3 text-base font-medium shadow-sm transition-colors'>
                Shop Now
              </span>
            </Link>

            <Link href='/about'>
              <span className='border-border text-foreground bg-background hover:bg-secondary inline-flex items-center justify-center rounded-full border px-8 py-3 text-base font-medium transition-colors'>
                Learn More
              </span>
            </Link>
          </div>
        </div>

        <div className='flex w-full justify-center lg:w-1/2 lg:justify-end'>
          <div className='relative h-[360px] w-full overflow-hidden rounded-[1.8rem] lg:h-[480px] lg:w-[800px]'>
            <Image
              src='/images/products/facepack.jpg'
              alt='Skincare products'
              fill
              className='object-cover'
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
