import React from 'react';
import AdminKpiCards from './AdminKpiCards';
import SalesTrendsChart from './SaleTrends';
import RecentOrdersTable from './RecentOrdersTable';
import TopProductsTable from './TopProductsTable';

const DashboardMain = () => {
  return (
    <div className='flex flex-col gap-5'>
      <AdminKpiCards />
      <SalesTrendsChart />
      <div className='flex gap-5'>
        <RecentOrdersTable />
        <TopProductsTable />
      </div>
    </div>
  );
};

export default DashboardMain;
