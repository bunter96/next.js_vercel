// components/Layout.js
"use client"; // Add this if you're using client-side features in children components

import { useState, useEffect } from 'react';
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Header />
      {/* Add a slight delay to ensure hydration completes */}
      <main className={`min-h-[70vh] ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
        {children}
      </main>
      <Footer />
    </>
  );
}