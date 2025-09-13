import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Check, Star, Zap, Crown, Sparkles } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

const PointsPurchase = () => {
  const { packages, points, addPoints, isAddingPoints, formatPrice, getPointsPerDollar } = usePoints();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    const selectedPkg = packages.find(pkg => pkg.id === packageId);
    if (!selectedPkg) return;

    setSelectedPackage(packageId);
    
    try {
      await addPoints({
        points: selectedPkg.points,
        transactionType: 'purchase',
        description: `Purchased ${selectedPkg.name} - ${selectedPkg.points} points`,
        referenceId: packageId
      });
      
      setSelectedPackage(null);
    } catch (error) {
      console.error('Purchase failed:', error);
      setSelectedPackage(null);
    }
  };

  const getPackageIcon = (points: number) => {
    if (points <= 50) return <Coins className="h-6 w-6" />;
    if (points <= 100) return <Zap className="h-6 w-6" />;
    if (points <= 200) return <Star className="h-6 w-6" />;
    return <Crown className="h-6 w-6" />;
  };

  const getPackageColor = (points: number) => {
    if (points <= 50) return 'from-blue-500 to-blue-600';
    if (points <= 100) return 'from-purple-500 to-purple-600';
    if (points <= 200) return 'from-orange-500 to-orange-600';
    return 'from-yellow-500 to-yellow-600';
  };

  const getPackageBadge = (points: number) => {
    if (points <= 50) return { text: 'Starter', color: 'bg-blue-100 text-blue-800' };
    if (points <= 100) return { text: 'Popular', color: 'bg-purple-100 text-purple-800' };
    if (points <= 200) return { text: 'Business', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Enterprise', color: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar title="Purchase Points" />
      
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Purchase Points</h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Buy points to screen resumes and conduct voice interviews
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6"
            >
              <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  Current Balance: {points} points
                </span>
              </div>
            </motion.div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {packages.map((pkg, index) => {
              const badge = getPackageBadge(pkg.points);
              const isPopular = pkg.points === 100;
              
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                    isPopular ? 'ring-2 ring-purple-500 shadow-xl' : 'hover:shadow-lg'
                  }`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getPackageColor(pkg.points)}`} />
                    
                    <CardHeader className="text-center pb-4">
                      <div className="flex items-center justify-center mb-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${getPackageColor(pkg.points)} text-white`}>
                          {getPackageIcon(pkg.points)}
                        </div>
                      </div>
                      
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {pkg.name}
                      </CardTitle>
                      
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Badge className={badge.color}>
                          {badge.text}
                        </Badge>
                      </div>
                      
                      <div className="text-4xl font-bold text-gray-900">
                        {formatPrice(pkg.price_cents)}
                      </div>
                      
                      <div className="text-lg text-gray-600">
                        {pkg.points} points
                      </div>
                    </CardHeader>
                    
                    <CardContent className="text-center">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{pkg.points} resume screenings</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{Math.floor(pkg.points / 2)} voice interviews</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{getPointsPerDollar(pkg.points, pkg.price_cents)} points per $1</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handlePurchase(pkg.id)}
                        disabled={isAddingPoints || selectedPackage === pkg.id}
                        className={`w-full bg-gradient-to-r ${getPackageColor(pkg.points)} hover:opacity-90 text-white font-semibold py-3`}
                      >
                        {selectedPackage === pkg.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Coins className="h-4 w-4 mr-2" />
                            Purchase Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              How Points Work
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Coins className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Screening</h3>
                <p className="text-gray-600">1 point per resume screened by AI</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Interviews</h3>
                <p className="text-gray-600">2 points per voice interview conducted</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Expiration</h3>
                <p className="text-gray-600">Points never expire, use them anytime</p>
              </div>
            </div>
          </motion.div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Need Help or Custom Packages?
              </h3>
              <p className="text-gray-600 mb-6">
                Contact our support team for assistance or custom point packages
              </p>
              <Button
                onClick={() => window.open('mailto:support@idraq.com', '_blank')}
                variant="outline"
                className="px-8 py-3"
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PointsPurchase;
