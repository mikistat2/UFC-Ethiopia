
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FightersPage() {
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
  fetch('http://localhost:5000/api/fighters')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFighters(data);
        } else if (Array.isArray(data.fighters)) {
          setFighters(data.fighters);
        } else {
          setError('No fighters found.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load fighters.');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto py-12 px-4 text-white">
        <h1 className="font-headline text-3xl text-ufcRed mb-6">Fighters</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <ul className="list-disc pl-6">
            {fighters.map((fighter, idx) => (
              <li key={idx} className="mb-1">{fighter}</li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
