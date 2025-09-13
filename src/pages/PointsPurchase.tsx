import React, { useState, useEffect } from 'react';
import { usePoints } from '@/hooks/usePoints';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { useSearchParams } from 'react-router-dom';
import PricingSection from '@/components/landing/PricingSection';

const PointsPurchase = () => {
  const { packages, createCheckout, isCreatingCheckout, refreshPoints } = usePoints();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Handle success/cancel from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      toast({
        title: "Payment Successful!",
        description: "Your points have been added to your account.",
      });
      refreshPoints();
      // Clean up URL
      window.history.replaceState({}, '', '/points-purchase');
    } else if (canceled === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. No charges were made.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/points-purchase');
    }
  }, [searchParams, toast, refreshPoints]);

  const handlePurchase = async (packageId: string) => {
    const selectedPkg = packages.find(pkg => pkg.id === packageId);
    if (!selectedPkg) return;

    setSelectedPackage(packageId);
    
    try {
      // Get the Stripe price ID from environment variables
      const priceId = getStripePriceId(selectedPkg.name);
      if (!priceId) {
        toast({
          title: "Error",
          description: "Price configuration not found for this package",
          variant: "destructive",
        });
        setSelectedPackage(null);
        return;
      }

      await createCheckout({
        packageId: selectedPkg.id,
        points: selectedPkg.points,
        priceId: priceId
      });
      
      setSelectedPackage(null);
    } catch (error) {
      console.error('Purchase failed:', error);
      setSelectedPackage(null);
    }
  };

  // Helper function to get Stripe price ID based on package name
  const getStripePriceId = (packageName: string): string | null => {
    const priceIdMap: { [key: string]: string } = {
      'Starter Pack': import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
      'Growth Pack': import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID,
      'Business Pack': import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID,
      'Enterprise Pack': import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
    };
    
    return priceIdMap[packageName] || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar title="Purchase Points" />
      
      <div className="pt-32">
        <PricingSection 
          isVisitor={false}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  );
};

export default PointsPurchase;
