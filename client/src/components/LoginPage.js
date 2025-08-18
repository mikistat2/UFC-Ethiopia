
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api';



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/events';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await login(email, password);
      setSuccess('Login successful! Redirecting...');
  localStorage.setItem('ufc_nickname', res.user.nickname);
  localStorage.setItem('ufc_user_id', res.user.id);
      setTimeout(() => navigate(from, { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-ufcBlack text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-ufcBlack rounded-xl shadow-lg p-8"
      >
        <h2 className="font-headline text-3xl text-ufcRed mb-6 text-center">Login to UFC Ethiopia</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="text-red-500 text-center">{error}</div>}
          {success && <div className="text-green-500 text-center">{success}</div>}
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
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            className="bg-ufcRed text-white px-6 py-2 rounded-full font-headline text-lg shadow-lg hover:bg-red-700 transition-colors"
          >
            Login
          </motion.button>
        </form>
        <div className="mt-6 text-center flex flex-col gap-2">
          <a href="#" className="text-ufcRed hover:underline">Forgot password?</a>
          <span className="text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-ufcRed hover:underline">Sign up</a>
          </span>
        </div>
      </motion.div>
    </section>
  );
}
