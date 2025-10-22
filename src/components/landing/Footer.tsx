import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Particles } from '@/components/ui/particles';
import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12 border-t border-gray-800 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-full">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg">{t('footer.brand')}</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
            <span 
              onClick={() => navigate('/privacy-policy')}
              className="hover:text-white cursor-pointer transition-colors"
            >
              {t('footer.links.privacy')}
            </span>
            <span 
              onClick={() => navigate('/terms-of-service')}
              className="hover:text-white cursor-pointer transition-colors"
            >
              {t('footer.links.terms')}
            </span>
            <span 
              onClick={() => navigate('/contact-us')}
              className="hover:text-white cursor-pointer transition-colors"
            >
              {t('footer.links.contact')}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-4 sm:mt-6 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-gray-400">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
