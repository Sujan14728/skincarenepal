import Image from 'next/image';

export default function Message() {
  return (
    <section className='py-12'>
      <div className='mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 md:flex-row md:gap-12'>
        {/* Image Container */}
        <div className='flex w-full flex-1 justify-center'>
          <div className='relative h-[420px] w-full max-w-[500px] overflow-hidden rounded-2xl shadow-md'>
            <Image
              src='/images/team/cofounder.jpg'
              alt='Founder'
              width={550}
              height={420}
              className='rounded-2xl object-cover'
            />
          </div>
        </div>

        {/* Text Content Container */}
        <div className='flex-1 text-center md:text-left'>
          <p className='mb-2 text-start text-lg italic leading-relaxed text-gray-600'>
            At Care and Clean, we believe that true beauty begins with nature.
            Our mission is to provide safe, effective, and affordable skincare
            solutions that help people feel confident in their own skin. Thank
            you for trusting us and being part of our journey toward natural
            beauty and healthy living.
          </p>
          <span className='mb-6 h-1 w-10 rounded font-bold text-primary'>
            Care from Nature, Clean by Choice
          </span>

          <div className='mt-4'>
            <h4 className='text-lg font-bold text-gray-900'>Parash Balayar</h4>
            <p className='text-base font-medium text-emerald-600'>
              Co-Founder & CEO
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
