import React from 'react';
import { AuroraHero } from '@/components/ui/futurastic-hero-section';
import { Particles } from '@/components/ui/particles';
import {
  HiringFunnel,
  HowItWorks,
  WhyChooseHirios,
  CandidateBenefits,
  ContactCTA,
  FAQ,
  Footer
} from '@/components/landing';
import PricingSection from '@/components/landing/PricingSection';


const HiriosLanding = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Futurastic Hero Section */}
      <AuroraHero />

      {/* Hiring Funnel Section */}
      <HiringFunnel />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose Hirios */}
      <WhyChooseHirios />

      {/* What Companies Get for Each Candidate */}
      <CandidateBenefits />

      {/* Contact CTA Section */}
      <ContactCTA />

      {/* Pricing Section */}
      <PricingSection 
        isVisitor={true}
        onGetStarted={() => {
          // Scroll to top and then navigate to auth
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            window.location.href = '/auth';
          }, 500);
        }}
      />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HiriosLanding; 