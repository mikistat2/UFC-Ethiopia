import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const images = [
  '../images/caeasel-1.avif',
  '../images/caeasel-2.avif',
  '../images/caeasel-3.avif',
  '../images/caeasel-4.avif',
  '../images/caeasel-5.avif',
  '../images/caeasel-6.webp',
];

export default function EventCarousel() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const intervalRef = useRef(null);

  const nextSlide = () => {
    setPrev(current);
    setCurrent((current + 1) % images.length);
  };
  const prevSlide = () => {
    setPrev(current);
    setCurrent((current - 1 + images.length) % images.length);
  };

  useEffect(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 2000);
    return () => clearInterval(intervalRef.current);
  }, [current]);

  // Reset timer on manual controls
  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 3000);
  };

  return (
    <div className="relative w-full max-w-full mx-auto mt-8" style={{ minHeight: '85vh' }}>
      <div className="overflow-hidden rounded-xl shadow-lg relative w-full h-full" style={{ minHeight: '85vh' }}>
        {/* Previous image fades out */}
        {prev !== null && (
          <motion.img
            key={prev}
            src={images[prev]}
            alt={`Event ${prev + 1}`}
            className="absolute top-0 left-0 w-full h-full object-cover"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}

        {/* Current image fades in */}
        <motion.img
          key={current}
          src={images[current]}
          alt={`Event ${current + 1}`}
          className="absolute top-0 left-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </div>

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white rounded-full p-3 hover:bg-red-600 transition-colors"
        onClick={() => {
          prevSlide();
          resetInterval();
        }}
        aria-label="Previous"
        style={{ zIndex: 10 }}
      >
        &#8592;
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white rounded-full p-3 hover:bg-red-600 transition-colors"
        onClick={() => {
          nextSlide();
          resetInterval();
        }}
        aria-label="Next"
        style={{ zIndex: 10 }}
      >
        &#8594;
      </button>

      <div className="flex justify-center mt-6 space-x-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`w-4 h-4 rounded-full transition-colors duration-300 ${
              idx === current ? 'bg-red-600' : 'bg-gray-400'
            }`}
            onClick={() => {
              setPrev(current);
              setCurrent(idx);
              resetInterval();
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
