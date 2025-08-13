import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function JoinSection() {
  const navigate = useNavigate();
  return (
    <section
      className="w-full flex flex-col items-center justify-center bg-black text-white"
      style={{ paddingTop: '4rem', paddingBottom: '4rem', fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ color: '#d03a3a', fontWeight: '700', fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}
      >
        Join the UFC Ethiopia Community
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{
          fontSize: '1.125rem',
          maxWidth: '36rem',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
          textAlign: 'center',
          color: '#f0f0f0',
          fontWeight: '400',
        }}
      >
        Connect with fellow fans, get exclusive updates, and never miss a moment of UFC action. Sign up, log in, or join our Telegram group to be part of the excitement!
      </motion.p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            backgroundColor: '#b03030',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '1.125rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(176, 48, 48, 0.4)',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#8b2323')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#b03030')}
          onClick={() => navigate('/login')}
        >
          Login
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            backgroundColor: '#fff',
            color: '#b03030',
            padding: '0.75rem 2rem',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '1.125rem',
            border: '2px solid #b03030',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(176, 48, 48, 0.3)',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
            e.currentTarget.style.color = '#8b2323';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#b03030';
          }}
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </motion.button>

        <motion.a
          href="https://t.me/ethioUFC" // Replace with your actual Telegram channel link
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            backgroundColor: '#0088cc',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '1.125rem',
            boxShadow: '0 4px 8px rgba(0, 136, 204, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#006699')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0088cc')}
        >
          <span>Join Telegram</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={{ width: '1.25rem', height: '1.25rem' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 3L3 10.53l5.25 2.02L17.5 7.5l-4.25 8.5 1.75 5.5 2.5-7.5"
            />
          </svg>
        </motion.a>
      </div>
    </section>
  );
}
