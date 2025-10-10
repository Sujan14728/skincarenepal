import Footer from '@/components/landing/Footer';
import { NavBar } from '@/components/landing/NavBar';
import React, { ReactNode } from 'react';

const LandingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default LandingLayout;
