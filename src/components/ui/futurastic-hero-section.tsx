import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Brain, BarChart3 } from "lucide-react";
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
  const color = useMotionValue(COLORS_TOP[0]);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    // Check WebGL support on mount
    setWebGLSupported(isWebGLSupported());
    
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
      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-1.5 inline-block rounded-full bg-blue-600/50 px-3 py-1.5 text-sm font-medium">
          AI-Powered Hiring Platform
        </span>
        <h1 className="max-w-4xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-bold leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
          Hire Smarter, Not Harder
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI-Powered Candidate Screening
          </span>
        </h1>
        <p className="my-6 max-w-2xl text-center text-base leading-relaxed md:text-xl md:leading-relaxed text-gray-300">
          Upload a job description and resumes—our AI analyzes fit, ranks candidates, and explains why. Build your talent database with intelligent skill tagging and track every candidate's journey. No more manual screening.
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
            Start Screening with AI
            <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
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
            See How It Works
            <BarChart3 className="transition-transform group-hover:scale-110" />
          </motion.button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-6xl">
          <div className="text-center">
            <div className="bg-blue-600/20 p-3 rounded-full w-fit mx-auto mb-3">
              <Brain className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold mb-2">Smart AI Analysis</h3>
            <p className="text-xs text-gray-400">Advanced algorithms match candidates to job requirements</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-600/20 p-3 rounded-full w-fit mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold mb-2">Instant Scoring</h3>
            <p className="text-xs text-gray-400">Get candidate scores and insights in seconds</p>
          </div>
          
          <div className="text-center">
            <div className="bg-cyan-600/20 p-3 rounded-full w-fit mx-auto mb-3">
              <FiArrowRight className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-sm font-semibold mb-2">Talent Database</h3>
            <p className="text-xs text-gray-400">Never lose a good candidate - search by AI-extracted skills</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-600/20 p-3 rounded-full w-fit mx-auto mb-3">
              <FiArrowRight className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-sm font-semibold mb-2">Journey Tracking</h3>
            <p className="text-xs text-gray-400">Track every candidate from application to decision</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        <SafeCanvas />
      </div>
    </motion.section>
  );
};
