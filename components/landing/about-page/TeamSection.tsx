'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type TeamMember = {
  id: number;
  name: string;
  title: string;
  image: string;
};

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/team-member')
      .then(res => res.json())
      .then(data => {
        setTeamMembers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className='pb-10'>
      <h2 className='mb-10 text-center text-3xl font-bold text-gray-600'>
        Meet Our Team
      </h2>

      <div className='flex flex-wrap justify-center gap-6'>
        {loading ? (
          // 🦴 Skeleton loader
          <TeamSectionSkeleton count={4} />
        ) : (
          teamMembers.map(member => (
            <div
              key={member.id}
              className='flex w-80 flex-col items-center rounded-2xl bg-white p-6 shadow-sm transition-opacity duration-500'
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
              <div className='mb-2 text-sm font-bold text-green-700'>
                {member.title}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function TeamSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className='flex w-80 animate-pulse flex-col items-center rounded-2xl bg-white p-6 shadow-sm'
        >
          <div className='mb-4 h-40 w-40 flex-shrink-0 rounded-full bg-gray-200' />
          <div className='mb-2 h-6 w-32 rounded bg-gray-200' />
          <div className='h-6 w-24 rounded bg-gray-200' />
        </div>
      ))}
    </>
  );
}
