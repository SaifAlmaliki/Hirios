import React from 'react';
import { Button } from '@/components/ui/button';
import { Particles } from '@/components/ui/particles';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
          Start Hiring with AI Today
        </h2>
        <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed px-2">
          Join hundreds of companies who've transformed their hiring process with Hirios
        </p>
        <Button 
          onClick={() => navigate('/auth')}
          size="lg"
          className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold hover:scale-105 transition-transform w-full sm:w-auto max-w-sm mx-auto"
        >
          Get Started - No Credit Card Needed
          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </section>
  );
};

export default FinalCTA;
