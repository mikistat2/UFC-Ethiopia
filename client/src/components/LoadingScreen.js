import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ufcBlack"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.2, delay: 1.2 }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1.1 }}
        transition={{ yoyo: Infinity, duration: 0.7 }}
        className="flex flex-col items-center"
      >
        <span className="font-headline text-5xl text-ufcRed mb-2">UFC Live</span>
        <div className="w-16 h-16 border-4 border-ufcRed border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 text-white text-lg font-body">Loading...</span>
      </motion.div>
    </motion.div>
  );
}
