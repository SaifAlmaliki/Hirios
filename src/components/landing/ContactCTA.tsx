import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Particles } from '@/components/ui/particles';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactCTA = () => {
  const navigate = useNavigate();
  const { t, tArray, isRTL } = useTranslation();

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('contactCTA.title')}</h2>
          <p className="text-lg sm:text-xl text-gray-300 px-4">{t('contactCTA.subtitle')}</p>
        </div>

        <Card className="border border-gray-700/50 shadow-xl bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-12 text-center">
            <div className="mb-6 sm:mb-8">
              <div className="bg-blue-600 p-3 sm:p-4 rounded-full w-fit mx-auto mb-4 sm:mb-6">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">{t('contactCTA.enterpriseTitle')}</h3>
              <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2">
                {t('contactCTA.enterpriseDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 text-sm sm:text-base">
              {tArray('contactCTA.features').map((feature: unknown, index: number) => (
                <div key={index} className={`flex items-center justify-center ${isRTL ? 'sm:justify-end' : 'sm:justify-start'} text-gray-200`}>
                  <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 text-green-400 ${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} flex-shrink-0`} />
                  <span>{typeof feature === 'string' ? feature : ''}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-600/50">
              <h4 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{t('contactCTA.contactTitle')}</h4>
              <div className="flex items-center justify-center text-blue-400 font-medium text-base sm:text-lg">
                <span className={isRTL ? 'ml-2' : 'mr-2'}>📧</span>
                <a href={`mailto:${t('contactCTA.contactEmail')}`} className="hover:underline break-all">
                  {t('contactCTA.contactEmail')}
                </a>
              </div>
              <p className="text-sm sm:text-base text-gray-300 mt-2 sm:mt-3">
                {t('contactCTA.contactDescription')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                onClick={() => window.open(`mailto:${t('contactCTA.contactEmail')}?subject=Hirios Demo Request&body=Hi, I'm interested in learning more about Hirios and would like to schedule a demo for my organization.`)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold hover:scale-105 transition-transform w-full sm:w-auto"
              >
                {t('contactCTA.requestDemo')}
                <ArrowRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                size="lg"
                className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold hover:scale-105 transition-transform w-full sm:w-auto"
              >
                {t('contactCTA.tryFree')}
                <Zap className={`${isRTL ? 'mr-2' : 'ml-2'} h-4 w-4 sm:h-5 sm:w-5`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactCTA;
