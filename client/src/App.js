// ...existing code...
import './App.css';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import HeroSection from './components/HeroSection';
import EventCarousel from './components/EventCarousel';
import EventsSection from './components/EventsSection';
import JoinSection from './components/JoinSection';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';

import WatchPage from './pages/WatchPage';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [loading, setLoading] = useState(true);
  const eventsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-ufcBlack min-h-screen text-white font-body mt-16">
      {loading && <LoadingScreen />}
      {!loading && (
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Navbar />
                  <HeroSection eventsRef={eventsRef} />
                  <EventCarousel />
                  {React.createElement(EventsSection, { ref: eventsRef })}
                  <JoinSection />
                  {/* TODO: Add countdown, etc. */}
                  <Footer />
                </motion.div>
              }
            />
            <Route
              path="/events"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Navbar />
                  <EventsSection />
                  <Footer />
                </motion.div>
              }
            />
            <Route path="/watch" element={
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Navbar />
                <WatchPage />
                <Footer />
              </motion.div>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
