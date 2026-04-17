import Footer from '@/components/landing/Footer';
import { NavBar } from '@/components/landing/NavBar';
import React, { ReactNode } from 'react';
import ClientMarquee from '@/components/ui/ClientMarquee';

const LandingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <ClientMarquee />
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default LandingLayout;
