// components/TestimonialsSection.tsx
import { TestimonialCard } from './partial/TestimonialCard';

const mockTestimonials = [
  {
    quote:
      'The Himalayan Rose Face Cream is absolutely amazing! My skin has never felt so soft and hydrated. Highly recommend!',
    customerName: 'Priya Sharma',
    location: 'Kathmandu',
    productPurchased: 'Himalayan Rose Face Cream'
  },
  {
    quote:
      "I've been using the Turmeric Glow Serum for two months now and the difference is incredible. My dark spots have faded significantly!",
    customerName: 'Anjali Thapa',
    location: 'Pokhara',
    productPurchased: 'Turmeric Glow Serum'
  },
  {
    quote:
      'Great products with natural ingredients. The Neem Face Mask really helps control my oily skin. Will definitely buy again!',
    customerName: 'Sita Rai',
    location: 'Lalitpur',
    productPurchased: 'Neem Purifying Face Mask'
  }
];

export function TestimonialsSection() {
  return (
    <section className='bg-background py-16 md:py-24'>
      <div className='mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8'>
        <div className='mb-12'>
          <h2 className='text-foreground mb-2 text-4xl font-bold'>
            What Our Customers Say
          </h2>
          <p className='text-muted-foreground text-lg'>
            Real reviews from real people
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {mockTestimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
