import React from 'react';
import { AuroraHero } from '@/components/ui/futurastic-hero-section';
import { Particles } from '@/components/ui/particles';
import {
  HowItWorks,
  VoiceInterviewCapabilities,
  WhyChooseHirios,
  ContactCTA,
  FAQ,
  FinalCTA,
  Footer
} from '@/components/landing';


const HiriosLanding = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Futurastic Hero Section */}
      <AuroraHero />

      {/* How It Works */}
      <HowItWorks />

      {/* AI Powered Voice Interview Capabilities */}
      <VoiceInterviewCapabilities />

      {/* Why Choose Hirios */}
      <WhyChooseHirios />

      {/* Contact CTA Section */}
      <ContactCTA />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HiriosLanding; 