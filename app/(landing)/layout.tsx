import Footer from '@/components/landing/Footer';
import { NavBar } from '@/components/landing/NavBar';
import React, { ReactNode } from 'react';
import Marquee from '@/components/ui/marquee';

const LandingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Marquee />
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default LandingLayout;
