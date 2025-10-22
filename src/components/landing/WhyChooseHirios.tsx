import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Particles } from '@/components/ui/particles';
import { 
  Brain,
  Upload,
  Target,
  Clock,
  Shield,
  Database,
  Tag,
  TrendingUp,
  Mail,
  Calendar,
  FileText,
  Search
} from 'lucide-react';

const WhyChooseHirios = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">{t('whyChoose.title')}</h2>
          <p className="text-xl text-gray-300">{t('whyChoose.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-blue-600/30">
              <Brain className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.aiScreening.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.aiScreening.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-green-600/30">
              <Upload className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.voiceInterviews.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.voiceInterviews.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-cyan-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-cyan-600/30">
              <Database className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.talentDatabase.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.talentDatabase.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-purple-600/30">
              <Tag className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.resumeTagging.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.resumeTagging.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-orange-600/30">
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.journeyTracking.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.journeyTracking.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-indigo-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-indigo-600/30">
              <Target className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.teamCollaboration.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.teamCollaboration.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-emerald-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-emerald-600/30">
              <Clock className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.timeSaved.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.timeSaved.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-pink-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-pink-600/30">
              <Shield className="h-8 w-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.modernUI.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.modernUI.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-amber-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-amber-600/30">
              <Mail className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.emailIntegration.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.emailIntegration.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-teal-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-teal-600/30">
              <Calendar className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.scheduling.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.scheduling.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-rose-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-rose-600/30">
              <FileText className="h-8 w-8 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.offerManagement.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.offerManagement.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-violet-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-violet-600/30">
              <Search className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">{t('whyChoose.features.talentSearch.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('whyChoose.features.talentSearch.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseHirios;
