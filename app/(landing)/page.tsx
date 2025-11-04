import { FeaturedProductsSection } from '@/components/landing/FeaturedProductSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { Hero } from '@/components/landing/Hero';
import { TestimonialsSection } from '@/components/landing/TestimonialSection';
import Popup from '@/components/landing/Popup';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturesSection />
      <FeaturedProductsSection />
      <TestimonialsSection />
      <Popup />
    </main>
  );
}
