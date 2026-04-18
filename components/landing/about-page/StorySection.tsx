import Image from 'next/image';

export default function StorySection() {
  return (
    <section>
      <h2 className='mb-10 text-center text-3xl font-bold text-gray-800'>
        Our Story
      </h2>

      <div className='mb-24 flex flex-col items-center gap-6 md:flex-row'>
        <div className='order-2 flex flex-1 justify-center md:order-2'>
          <Image
            src='/images/about/story.png'
            alt='Care And Clean Nepal Story'
            width={500}
            height={400}
            className='h-90 w-100 rounded-2xl object-cover'
          />
        </div>

        <div className='order-3 flex-1 md:order-1'>
          <p className='mb-4 text-lg text-gray-600'>
            Care and Clean Pvt. Ltd. was founded with a simple yet powerful
            belief-true beauty begins with nature. We are a Nepali skincare
            brand dedicated to creating safe, effective, and affordable products
            made from natural ingredients found within Nepal.
          </p>
          <p className='mb-4 text-lg text-gray-600'>
            Our journey started with our very first product- the 2-in-1 Face
            Pack, a unique blend that works as both a scrub and a face pack. It
            deeply cleanses, smoothens, and brightens the skin, giving it a
            fresh, natural glow.
          </p>
          <p className='text-lg text-gray-600'>
            At present, we are expanding our skincare range-working on new
            products like Face Wash, Sunscreen, and Moisturizer. Our goal is
            simple-to bring natural care and clean beauty to every home across
            Nepal.
            <span> “Care from Nature, Clean by Choice.”</span>
          </p>
        </div>
      </div>
    </section>
  );
}
