import React from 'react';
import { motion } from 'framer-motion';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-dark relative overflow-hidden">
      {/* Glow backgrounds matching index.css design language */}
      <div className="absolute top-[10%] left-[10%] w-[35vw] h-[35vw] bg-foundational/8 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] bg-collaborative/8 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[40%] w-[25vw] h-[25vw] bg-applied/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[480px] bg-[#121420]/65 border border-white/8 rounded-[24px] p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md relative z-10 text-center"
      >
        {children}
      </motion.div>
    </div>
  );
};
export default AuthLayout;
