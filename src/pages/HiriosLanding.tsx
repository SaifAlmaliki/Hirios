import React from 'react';
import { AuroraHero } from '@/components/ui/futurastic-hero-section';
import { Particles } from '@/components/ui/particles';
import {
  HiringFunnel,
  HowItWorks,
  WhyChooseHirios,
  ContactCTA,
  FAQ,
  Footer
} from '@/components/landing';


const HiriosLanding = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Futurastic Hero Section */}
      <AuroraHero />

      {/* Why Choose Hirios */}
      <WhyChooseHirios />

      {/* Hiring Funnel Section */}
      <HiringFunnel />

      {/* How It Works */}
      <HowItWorks />

      {/* Contact CTA Section */}
      <ContactCTA />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HiriosLanding; 