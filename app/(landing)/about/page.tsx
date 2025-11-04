import StorySection from '../../../components/landing/about-page/StorySection';
import TeamSection from '../../../components/landing/about-page/TeamSection';
import ValuesSection from '../../../components/landing/about-page/ValuesSection';

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-6xl px-4 py-12'>
      <StorySection />
      <TeamSection />
      <ValuesSection />

      {/* Join Our Journey */}
      <div className='mb-16 rounded-xl bg-[var(--primary)] p-8 text-center text-white'>
        <h3 className='mb-2 text-xl font-bold'>Join Our Journey</h3>
        <p>
          Be part of a community that values natural beauty, sustainability, and
          ethical practices. Together, we can make a difference.
        </p>
      </div>
    </div>
  );
}
