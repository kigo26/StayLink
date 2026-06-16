import React from 'react';
import { motion } from 'motion/react';

export const StayLinkAnimated = ({ className }: { className?: string }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.svg viewBox="0 0 500 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" variants={containerVariants} initial="hidden" animate="visible">
      
      {/* 1. Environment Wake-up: Faint light streaks */}
      <motion.path d="M0 250 H500" stroke="url(#streakGradient)" strokeWidth="1" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.5, times: [0, 0.5, 1] }} />

      {/* 2 & 3. Network Connection & Convergence */}
      <motion.g initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ delay: 0.5, duration: 0.8 }}>
        <circle cx="100" cy="100" r="4" fill="#60A5FA" />
        <circle cx="400" cy="400" r="4" fill="#60A5FA" />
        <motion.path d="M100 100 L250 250 L400 400" stroke="#3B82F6" strokeWidth="2" strokeDasharray="10 5" />
      </motion.g>

      {/* 4 & 5. Assembly */}
      <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.3, duration: 0.6 }}>
        {/* Roof */}
        <motion.path d="M160 170 L250 100 L340 170 Z" fill="#0284C7" />
        {/* House Body */}
        <motion.path d="M180 180 L250 125 L320 180 C320 220 280 250 250 280 C220 250 180 220 180 180 Z" fill="white" />
        {/* Windows */}
        <g>
            <rect x="224" y="150" width="22" height="22" fill="#0284C7" />
            <rect x="254" y="150" width="22" height="22" fill="#0284C7" />
            <rect x="224" y="180" width="22" height="22" fill="#0284C7" />
            <rect x="254" y="180" width="22" height="22" fill="#0284C7" />
        </g>
      </motion.g>

      {/* 6. Link Text */}
      <foreignObject x="150" y="320" width="200" height="100">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9, duration: 0.4 }} className="text-white text-4xl font-black text-center">
            Stay<span className="text-blue-500">Link</span>
        </motion.div>
      </foreignObject>

      {/* Gradient for streaks */}
      <defs>
        <linearGradient id="streakGradient" x1="0" y1="0" x2="500" y2="0">
          <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0" />
          <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
          <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
        </linearGradient>
      </defs>

    </motion.svg>
  );
};
