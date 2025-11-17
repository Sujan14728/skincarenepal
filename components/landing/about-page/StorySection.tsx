import Image from 'next/image';

export default function StorySection() {
  return (
    <section className='mb-24 flex flex-col items-center gap-6 md:flex-row'>
      <div className='flex-1'>
        <h2 className='mb-10 text-center text-3xl font-bold text-gray-800'>
          Our Story
        </h2>
        <p className='mb-4 text-lg text-gray-600'>
          Care and Clean Pvt. Ltd. was founded with a simple yet powerful
          belief-true beauty begins with nature. We are a Nepali skincare brand
          dedicated to creating safe, effective, and affordable products made
          from natural ingredients found within Nepal.
        </p>
        <p className='mb-4 text-lg text-gray-600'>
          Our journey started with our very first product- the 2-in-1 Face Pack,
          a unique blend that works as both a scrub and a face pack. It deeply
          cleanses, smoothens, and brightens the skin, giving it a fresh,
          natural glow.
        </p>
        <p className='text-lg text-gray-600'>
          At present, we are expanding our skincare range-working on new
          products like Face Wash, Sunscreen, and Moisturizer. Our goal is
          simple-to bring natural care and clean beauty to every home across
          Nepal.
          <span> “Care from Nature, Clean by Choice.”</span>
        </p>
      </div>

      <div className='flex flex-1 justify-center'>
        <Image
          src='/images/about/story.jpg'
          alt='Care And Clean Nepal Story'
          width={390}
          height={370}
          className='h-90 w-100 rounded-2xl object-cover'
        />
      </div>
    </section>
  );
}
