// components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-900 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-300 text-sm">
        <p>
          © {new Date().getFullYear()} Fish Audio 🎧 — All rights reserved.
        </p>
        <p className="mt-2">
          Built with <span className="text-pink-400">❤️</span> using <span className="text-blue-400">Next.js</span>, <span className="text-sky-400">Tailwind CSS</span>, and <span className="text-orange-400">Appwrite</span>
        </p>
      </div>
    </footer>
  );
}
