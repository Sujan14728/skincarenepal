import { Leaf, Users, Heart, CheckCircle, Recycle, Award } from 'lucide-react';

const values = [
  {
    icon: <Leaf className='h-10 w-10 text-gray-200' />,
    title: '100% Natural',
    description:
      'We use only pure, organic ingredients sourced ethically from the Himalayan region. No harmful chemicals, ever.'
  },
  {
    icon: <Users className='h-10 w-10 text-gray-200' />,
    title: 'Community First',
    description:
      'We work directly with local farmers and communities, ensuring fair trade and supporting sustainable livelihoods.'
  },
  {
    icon: <Heart className='h-10 w-10 text-gray-200' />,
    title: 'Cruelty-Free',
    description:
      'All our products are never tested on animals. We believe in beauty without cruelty.'
  },
  {
    icon: <CheckCircle className='h-10 w-10 text-gray-200' />,
    title: 'Quality Assured',
    description:
      'Every product undergoes rigorous testing to ensure safety, efficacy, and the highest quality standards.'
  },
  {
    icon: <Recycle className='h-10 w-10 text-gray-200' />,
    title: 'Sustainability',
    description:
      'We’re committed to eco friendly practices, from sourcing to packaging, minimizing our environmental footprint.'
  },
  {
    icon: <Award className='h-10 w-10 text-gray-200' />,
    title: 'Excellence',
    description:
      'We strive for excellence in every aspect, from formulation to customer service, delivering exceptional results.'
  }
];

export default function ValuesSection() {
  return (
    <section>
      <h2 className='mb-6 text-center text-2xl font-bold text-gray-600'>
        Our Values
      </h2>

      <div className='mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
        {values.map(value => (
          <div
            key={value.title}
            className='flex flex-col rounded-xl bg-white p-6 text-center shadow'
          >
            <div className='mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-green-600 text-left text-4xl'>
              {value.icon}
            </div>
            <div className='mb-1 text-start font-bold'>{value.title}</div>
            <div className='text-start text-sm text-gray-600'>
              {value.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
