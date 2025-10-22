import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Brain, BarChart3, Languages } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { useNavigate } from "react-router-dom";

const COLORS_TOP = ["#3B82F6", "#1E40AF", "#8B5CF6", "#7C3AED"];

// Check if WebGL is available
const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

// Fallback animated stars using CSS
const CSSStarField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <style>{`
        @keyframes animStar {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-2000px);
          }
        }
        .stars, .stars2, .stars3 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }
        .stars {
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 50px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 10px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: animStar 100s linear infinite;
          opacity: 0.4;
        }
        .stars2 {
          background-image: 
            radial-gradient(1px 1px at 100px 150px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 150px 20px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 40px 80px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 250px 250px;
          animation: animStar 150s linear infinite;
          opacity: 0.3;
        }
        .stars3 {
          background-image: 
            radial-gradient(1px 1px at 170px 50px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 80px 180px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 190px 140px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 300px 300px;
          animation: animStar 200s linear infinite;
          opacity: 0.2;
        }
      `}</style>
    </div>
  );
};

// Safe Canvas wrapper with error boundary
const SafeCanvas = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when component mounts
    setHasError(false);
  }, []);

  if (hasError || !checkWebGLSupport()) {
    return <CSSStarField />;
  }

  try {
    return (
      <Canvas
        onCreated={() => {
          // Canvas created successfully
        }}
        onError={() => {
          setHasError(true);
        }}
      >
        <Stars radius={50} count={2500} factor={4} fade speed={2} />
      </Canvas>
    );
  } catch (error) {
    return <CSSStarField />;
  }
};

export const AuroraHero = () => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage, isRTL } = useTranslation();
  const color = useMotionValue(COLORS_TOP[0]);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    // Check WebGL support on mount
    setWebGLSupported(checkWebGLSupport());
    
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
    >
      {/* Language Switcher */}
      <div className={`absolute top-6 z-20 flex items-center gap-3 ${isRTL ? 'left-6' : 'right-6'}`}>
        <motion.button
          onClick={toggleLanguage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-full bg-gray-800/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white border border-gray-700/50 hover:bg-gray-700/80 transition-colors"
        >
          <Languages className="h-4 w-4" />
          <span>{language === 'en' ? 'AR' : 'EN'}</span>
        </motion.button>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-1.5 inline-block rounded-full bg-blue-600/50 px-3 py-1.5 text-sm font-medium">
          {t('hero.badge')}
        </span>
        <h1 className="max-w-4xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-bold leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
          {t('hero.title')}
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('hero.subtitle')}
          </span>
        </h1>
        <p className="my-6 max-w-2xl text-center text-base leading-relaxed md:text-xl md:leading-relaxed text-gray-300">
          {t('hero.description')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <motion.button
            onClick={() => navigate('/auth')}
            style={{
              border,
              boxShadow,
            }}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className="group relative flex w-fit items-center gap-1.5 rounded-full bg-blue-600/20 px-6 py-3 text-gray-50 transition-colors hover:bg-blue-600/30 font-semibold"
          >
            {t('hero.cta_primary')}
            <FiArrowRight className={`transition-transform group-hover:-rotate-45 group-active:-rotate-12 ${isRTL ? 'rotate-180' : ''}`} />
          </motion.button>
          
          <motion.button
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-800/50 px-6 py-3 text-gray-50 transition-colors hover:bg-gray-800/70 font-semibold border border-gray-600/50"
          >
            {t('hero.cta_secondary')}
            <BarChart3 className="transition-transform group-hover:scale-110" />
          </motion.button>
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        <SafeCanvas />
      </div>
    </motion.section>
  );
};
