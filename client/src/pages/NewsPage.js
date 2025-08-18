import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NewsPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto py-12 px-4 text-white">
        <h1 className="font-headline text-3xl text-ufcRed mb-6">UFC News</h1>
        <p>Coming soon: Latest UFC news and updates!</p>
      </main>
      <Footer />
    </div>
  );
}
