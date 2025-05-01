// components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between items-center text-gray-400">
          <div className="text-center md:text-left">
            <h2 className="text-lg font-semibold text-white">Fish Audio 🎧</h2>
            <p className="mt-2 text-sm">
              © {new Date().getFullYear()} Fish Audio — All rights reserved.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex space-x-6">
            <a href="/about" className="hover:text-white text-sm">About</a>
            <a href="/contact" className="hover:text-white text-sm">Contact</a>
            <a href="/privacy-policy" className="hover:text-white text-sm">Privacy</a>
            <a href="/terms-of-service" className="hover:text-white text-sm">Terms</a>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-6">
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            <span className="sr-only">Twitter</span>
            {/* Insert a Twitter Icon here if you have Heroicons or similar */}
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 19c11 0 17-9.6 17-17.9 0-.3 0-.5-.1-.8A12.3 12.3 0 0028 0a11.3 11.3 0 01-3.2.9A5.6 5.6 0 0027 0a11.3 11.3 0 01-3.6 1.4A5.6 5.6 0 0020 0c-3.2 0-5.6 2.8-5.6 6.2 0 .5 0 1 .1 1.5A15.9 15.9 0 013 1a6.3 6.3 0 002 8.2 5.4 5.4 0 01-2.5-.7v.1c0 3 2 5.6 5 6.2a5.7 5.7 0 01-2.5.1 5.6 5.6 0 005.2 4.2A11.4 11.4 0 013 19.5 15.9 15.9 0 008 19z"/>
            </svg>
          </a>
          {/* Add other social media similarly */}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Built with <span className="text-pink-400">❤️</span> using <span className="text-blue-400">Next.js</span>, <span className="text-sky-400">Tailwind CSS</span>, and <span className="text-orange-400">Appwrite</span>
        </div>
      </div>
    </footer>
  );
}
