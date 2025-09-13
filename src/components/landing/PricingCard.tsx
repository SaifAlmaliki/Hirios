import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Check, Star, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingCardProps {
  name: string;
  points: number;
  priceCents: number;
  isPopular?: boolean;
  onPurchase?: () => void;
  isVisitor?: boolean;
  index?: number;
  // For database packages
  id?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  name,
  points,
  priceCents,
  isPopular = false,
  onPurchase,
  isVisitor = false,
  index = 0
}) => {
  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(0)}`;
  };

  const getPointsPerDollar = (points: number, priceCents: number): number => {
    return Math.round((points / priceCents) * 100 * 100) / 100;
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

  const badge = getPackageBadge(points);

  return (
    <motion.div
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
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getPackageColor(points)}`} />
        
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full bg-gradient-to-r ${getPackageColor(points)} text-white`}>
              {getPackageIcon(points)}
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            {name}
          </CardTitle>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge className={badge.color}>
              {badge.text}
            </Badge>
          </div>
          
          <div className="text-4xl font-bold text-gray-900">
            {formatPrice(priceCents)}
          </div>
          
          <div className="text-lg text-gray-600">
            {points} points
          </div>
        </CardHeader>
        
        <CardContent className="text-center">
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-500" />
              <span>{points} resume screenings</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-500" />
              <span>{Math.floor(points / 2)} voice interviews</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-500" />
              <span>{getPointsPerDollar(points, priceCents)} points per $1</span>
            </div>
          </div>
          
          {isVisitor ? (
            <Button
              onClick={onPurchase}
              className={`w-full bg-gradient-to-r ${getPackageColor(points)} hover:opacity-90 text-white font-semibold py-3`}
            >
              <Coins className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          ) : (
            <Button
              onClick={onPurchase}
              className={`w-full bg-gradient-to-r ${getPackageColor(points)} hover:opacity-90 text-white font-semibold py-3`}
            >
              <Coins className="h-4 w-4 mr-2" />
              Purchase Now
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PricingCard;
