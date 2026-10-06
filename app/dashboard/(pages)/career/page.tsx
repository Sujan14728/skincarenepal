import { Briefcase } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';

export default function CareerDashboardPage() {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Careers'
        description='Job openings shown on the storefront.'
      />
      <section className='rounded-xl border bg-card shadow-xs'>
        <EmptyState
          icon={Briefcase}
          title='Careers are not set up yet'
          description='Job listings will be managed here once the careers page is live.'
        />
      </section>
    </div>
  );
}
