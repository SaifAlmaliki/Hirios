import React from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Particles } from '@/components/ui/particles';
import PricingCard from './PricingCard';
import HowPointsWork from './HowPointsWork';
import { usePoints } from '@/hooks/usePoints';

interface PricingSectionProps {
  isVisitor?: boolean;
  onGetStarted?: () => void;
  onPurchase?: (packageId: string) => void;
}

// Static pricing data for landing page (visitors)
const staticPricingPackages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    points: 50,
    priceCents: 5000, // $50
  },
  {
    id: 'growth',
    name: 'Growth Pack',
    points: 100,
    priceCents: 8000, // $80
  },
  {
    id: 'business',
    name: 'Business Pack',
    points: 200,
    priceCents: 15000, // $150
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    points: 500,
    priceCents: 25000, // $250
  },
];

export const PricingSection: React.FC<PricingSectionProps> = ({
  isVisitor = true,
  onGetStarted,
  onPurchase
}) => {
  // Use actual packages from database for logged-in users, static for visitors
  const { packages: dbPackages } = usePoints();
  const pricingPackages = isVisitor ? staticPricingPackages : dbPackages;

  const handleCardClick = (packageId: string) => {
    if (isVisitor) {
      // For visitors, redirect to signup or scroll to pricing
      if (onGetStarted) {
        onGetStarted();
      }
    } else {
      // For logged-in users, handle purchase
      if (onPurchase) {
        onPurchase(packageId);
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white">Simple, Transparent Pricing</h2>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Pay only for what you use. No subscriptions, no hidden fees.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingPackages.map((pkg, index) => (
            <PricingCard
              key={pkg.id}
              id={pkg.id}
              name={pkg.name}
              points={pkg.points}
              priceCents={pkg.price_cents || pkg.priceCents}
              isPopular={pkg.points === 100}
              isVisitor={isVisitor}
              index={index}
              onPurchase={() => handleCardClick(pkg.id)}
            />
          ))}
        </div>

        {/* How Points Work */}
        <HowPointsWork isVisitor={isVisitor} />

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Need Help or Custom Packages?
            </h3>
            <p className="text-gray-300 mb-6">
              Contact our support team for assistance or custom point packages
            </p>
            <Button
              onClick={() => window.open('mailto:support@idraq.com', '_blank')}
              variant="outline"
              className="px-8 py-3 border-gray-600 text-gray-900 bg-white hover:bg-gray-100 hover:text-gray-900"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
