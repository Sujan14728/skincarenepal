import type { Metadata } from 'next';
import DashboardMain from '@/components/dashboard/dashboard';

export const metadata: Metadata = { title: 'Dashboard · Care & Clean Admin' };

export default function DashboardPage() {
  return (
    <>
      <h1 className='sr-only'>Dashboard</h1>
      <DashboardMain />
    </>
  );
}
