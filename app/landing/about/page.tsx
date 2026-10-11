/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, CheckCircle, Heart, Leaf, Recycle, Users } from 'lucide-react';
import { AboutGrid } from '@/components/storefront/home/HomeView';
import RevealOnScroll from '@/components/storefront/RevealOnScroll';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Care And Clean is a Nepali herbal skincare brand — care from nature, clean by choice.',
  alternates: { canonical: '/about' }
};

const VALUES = [
  {
    icon: Leaf,
    title: '100% Natural',
    description:
      'Pure ingredients sourced ethically from the Himalayan region. No harmful chemicals, ever.'
  },
  {
    icon: Users,
    title: 'Community First',
    description:
      'We work directly with local farmers and communities, supporting fair, sustainable livelihoods.'
  },
  {
    icon: Heart,
    title: 'Cruelty-Free',
    description:
      'Our products are never tested on animals. We believe in beauty without cruelty.'
  },
  {
    icon: CheckCircle,
    title: 'Quality Assured',
    description:
      'Every product is tested for safety, efficacy and the highest quality standards.'
  },
  {
    icon: Recycle,
    title: 'Sustainability',
    description:
      'Eco-friendly practices from sourcing to packaging, minimising our environmental footprint.'
  },
  {
    icon: Award,
    title: 'Excellence',
    description:
      'From formulation to customer service, we strive to deliver exceptional results.'
  }
];

// Team members stay hidden until the team section is ready to go live.
export default function AboutPage() {
  return (
    <main className='cc-home'>
      <RevealOnScroll />

      <section className='page-hero section-pad'>
        <p className='eyebrow'>Our story</p>
        <h1>About Care &amp; Clean</h1>
        <p>Care from Nature, Clean by Choice.</p>
      </section>

      <section className='about section-pad' style={{ paddingTop: 40 }}>
        <AboutGrid />
      </section>

      <section className='products section-pad'>
        <div className='product-list'>
          <article className='product-block'>
            <div className='product-block-art fade-up slide-in-left'>
              <figure className='photo-frame product-block-photo'>
                <img
                  src='/images/about/story.png'
                  alt='The Care and Clean Nepal story'
                  loading='lazy'
                />
              </figure>
            </div>
            <div className='product-details fade-up'>
              <p className='eyebrow'>How it started</p>
              <h3>Our Story</h3>
              <p>
                Care and Clean Pvt. Ltd. was founded with a simple yet powerful
                belief — true beauty begins with nature. We are a Nepali
                skincare brand dedicated to creating safe, effective and
                affordable products made from natural ingredients found within
                Nepal.
              </p>
              <p>
                Our journey started with our very first product, the 2-in-1 Face
                Pack — a unique blend that works as both a scrub and a face
                pack. It deeply cleanses, smoothens and brightens the skin,
                giving it a fresh, natural glow.
              </p>
              <p>
                Today our range has grown into a complete daily routine, and our
                goal is still simple: to bring natural care and clean beauty to
                every home across Nepal.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className='contact section-pad'>
        <div className='section-heading centered fade-up'>
          <p className='eyebrow'>What we stand for</p>
          <h2>Our Values</h2>
        </div>
        <div
          className='contact-cards'
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
          }}
        >
          {VALUES.map(({ icon: Icon, title, description }) => (
            <article key={title} className='fade-up'>
              <Icon />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='routine section-pad'>
        <div className='section-heading centered fade-up'>
          <h2>Join Our Journey</h2>
          <p>
            Be part of a community that values natural beauty, sustainability
            and ethical practices.
          </p>
        </div>
        <Link className='button solid' href='/products'>
          Shop the Range
        </Link>
      </section>
    </main>
  );
}
