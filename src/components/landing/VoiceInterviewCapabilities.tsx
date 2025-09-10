import React from 'react';
import { Button } from '@/components/ui/button';
import { Particles } from '@/components/ui/particles';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceInterviewCapabilities = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">AI Powered Voice Interview Capabilities</h2>
          <p className="text-xl text-gray-300">This is how we collect detailed candidate information before human interviews</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Responsive Layout: Side-by-side on large screens, stacked on smaller screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Image Container - Left side on large screens */}
            <div className="relative group order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-xl">
                <img 
                  src="/voice interview.png" 
                  alt="AI Voice Interview Interface - Jane Smith Solutions Architect Interview"
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto h-auto rounded-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl border border-white/20 cursor-pointer"
                  onClick={() => window.open('/voice interview.png', '_blank')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Interactive Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Container - Right side on large screens */}
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-600/30 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-4">Comprehensive Information Collection</h4>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Our AI voice interviewer automatically collects detailed candidate information including:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
                  <div className="flex items-center text-gray-300 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Motivation for role
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Time management strategy
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Recent experience summary
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Preferred work environment
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Relevant skills & tools
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Career expectations
                  </div>
                  <div className="flex items-center text-gray-300 text-sm sm:col-span-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Availability & start date
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  This comprehensive data collection streamlines your hiring process by providing all the essential 
                  information you need before conducting human interviews.
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Try Voice Interview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceInterviewCapabilities;
