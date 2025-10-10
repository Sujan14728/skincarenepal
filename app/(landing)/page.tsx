import { FeaturedProductsSection } from '@/components/landing/FeaturedProductSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { Hero } from '@/components/landing/Hero';
import { TestimonialsSection } from '@/components/landing/TestimonialSection';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturesSection />
      <FeaturedProductsSection />
      <TestimonialsSection />
    </main>
  );
}
