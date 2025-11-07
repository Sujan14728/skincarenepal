'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type TeamMember = {
  id: number;
  name: string;
  title: string;
  image: string;
};

// const teamMembers = [
//   {
//     name: 'PARASH BALAYAR',
//     title: 'FOUNDER & CEO',
//     image: '/images/team/parash.jpg'
//   },
//   {
//     name: 'SAGAR ROKAYA',
//     title: 'HEAD OF PRODUCT DEVELOPMENT',
//     image: '/images/team/sagar.jpg'
//   },
//   {
//     name: 'SITA',
//     title: 'CUSTOMER SERVICE REPRESENTATIVE',
//     image: '/images/team/priya.jpg'
//   }
// ];

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetch('/api/team-member', { cache: 'force-cache' })
      .then(res => res.json())
      .then(setTeamMembers);
  }, []);

  return (
    <section className='mb-24 pb-10'>
      <h2 className='mb-10 text-center text-3xl font-bold text-gray-800'>
        Meet Our Team
      </h2>

      <div className='flex flex-wrap justify-center gap-6 md:justify-start'>
        {teamMembers.map((member: TeamMember) => (
          <div
            key={member.id}
            className='flex w-80 flex-col items-center rounded-2xl bg-white p-6'
          >
            {member?.image && String(member.image).trim() !== '' ? (
              <Image
                src={member.image}
                alt={member?.name || 'Team member'}
                width={150}
                height={150}
                className='mb-4 h-40 w-40 rounded-full object-cover'
              />
            ) : (
              <div
                className='mb-4 flex h-40 w-40 items-center justify-center rounded-full bg-gray-200 text-4xl font-bold text-gray-600'
                aria-label={`${member?.name || 'Member'} avatar placeholder`}
              >
                {(member?.name?.charAt(0) || '?').toUpperCase()}
              </div>
            )}
            <div className='text-lg font-semibold text-gray-600'>
              {member.name}
            </div>
            <div className='mb-2 text-sm font-bold text-[var(--primary)]'>
              {member.title}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
