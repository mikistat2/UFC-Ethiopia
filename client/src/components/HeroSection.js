
export default function HeroSection({ eventsRef }) {
  const navigate = useNavigate();
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] flex items-center justify-center overflow-hidden hero-bg">
      {/* Animated background video or highlight loop */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        autoPlay
        loop
        muted
        playsInline
        src="/ufc-highlight.mp4" // Replace with your highlight video path
      />
      {/* Overlay and animated text */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-ufcRed mb-4 drop-shadow-lg text-center"
        >
          Feel the Community
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-white text-base sm:text-lg md:text-2xl font-body text-center mb-8 max-w-2xl"
        >
          Watch Real-time live UFC fight with People you know with the Ethiopian UFC community. 
        </motion.p>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="bg-ufcRed text-white px-6 py-2 sm:px-8 sm:py-3 rounded-full font-headline text-lg sm:text-xl shadow-lg hover:bg-red-700 transition-colors"
          onClick={() => navigate('/events')}
        >
          See Upcoming Events
        </motion.button>
      </div>
    </section>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
