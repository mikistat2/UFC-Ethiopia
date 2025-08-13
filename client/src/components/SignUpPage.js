import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Passwords do not match!');
      return;
    }
    if (!nickname.trim()) {
      alert('Please enter a nickname!');
      return;
    }
  localStorage.setItem('ufc_nickname', nickname.trim());
  // Redirect to dedicated events page
  navigate('/events');
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-ufcBlack text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-ufcBlack rounded-xl shadow-lg p-8"
      >
        <h2 className="font-headline text-3xl text-ufcRed mb-6 text-center">Sign Up for UFC Ethiopia</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-ufcRed"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-ufcRed"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-ufcRed"
          />
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            required
            className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-ufcRed"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            className="bg-ufcRed text-white px-6 py-2 rounded-full font-headline text-lg shadow-lg hover:bg-red-700 transition-colors"
          >
            Sign Up
          </motion.button>
        </form>
        <div className="mt-6 text-center">
          <a href="#" className="text-ufcRed hover:underline">Already have an account? Login</a>
        </div>
      </motion.div>
    </section>
  );
}
