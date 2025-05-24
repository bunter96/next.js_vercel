// pages/index.js
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  PresentationChartLineIcon,
  MusicalNoteIcon,
  LockClosedIcon,
  UserGroupIcon,
  CpuChipIcon,
} from "@heroicons/react/24/solid";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <motion.div
          className="max-w-7xl mx-auto px-4 py-24 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Fish Audio 🎧 — Smart Audio Intelligence Platform
          </h1>
          <p className="text-xl mb-8">
            Analyze, manage, and interact with sound like never before.
          </p>
          <a
            href="#"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            Try It Now
          </a>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="bg-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">What is Fish Audio?</h2>
          <p className="text-gray-600 text-lg">
            Fish Audio is a full-stack web platform that uses Fish.Audio API to let users analyze,
            process, and visualize audio in real-time. Built with modern tools and security-first architecture,
            it provides deep insights into audio content.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">🔥 Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[{
            icon: MusicalNoteIcon,
            title: "Real-time Audio Analysis",
            desc: "Visualize audio data live as it streams in using the Fish.Audio API.",
          }, {
            icon: ShieldCheckIcon,
            title: "Secure JWT Auth",
            desc: "Protect user sessions with HTTP-only cookies and JWT tokens.",
          }, {
            icon: CpuChipIcon,
            title: "Server Side Rendering",
            desc: "All logic and APIs handled on secure, performant servers.",
          }].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
            >
              <item.icon className="h-10 w-10 text-blue-600 mb-4 mx-auto" />
              <h4 className="text-xl font-bold text-blue-600 mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <LockClosedIcon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h3 className="text-3xl font-bold text-gray-800 mb-6">🔒 Built for Security</h3>
          <p className="text-lg text-gray-600 mb-8">
            From encrypted sessions to CORS control, Appwrite auth to input sanitization —
            we built Fish Audio to be rock-solid secure.
          </p>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-10">🧰 Powered By</h3>
        <div className="flex justify-center flex-wrap gap-6 text-lg text-gray-700 font-medium">
          <span className="bg-gray-200 px-5 py-2 rounded">Next.js</span>
          <span className="bg-gray-200 px-5 py-2 rounded">Tailwind CSS</span>
          <span className="bg-gray-200 px-5 py-2 rounded">Appwrite</span>
          <span className="bg-gray-200 px-5 py-2 rounded">Google Auth</span>
          <span className="bg-gray-200 px-5 py-2 rounded">Fish.Audio API</span>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <PresentationChartLineIcon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h3 className="text-3xl font-bold text-gray-800 mb-10">⚙️ How It Works</h3>
          <ol className="text-gray-600 space-y-4 text-left md:text-center list-decimal list-inside text-lg">
            <li>Sign in securely with your Google account.</li>
            <li>Upload or stream audio files via browser.</li>
            <li>View real-time audio breakdown and metadata.</li>
            <li>Manage account and session with secure backend APIs.</li>
            <li>Export or share results to collaborate with others.</li>
          </ol>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-20 px-4 text-center">
        <UserGroupIcon className="h-10 w-10 mx-auto mb-4 text-white" />
        <h3 className="text-4xl font-bold mb-6">Join the Future of Sound Intelligence</h3>
        <p className="text-lg mb-8">
          Get started now and experience intelligent audio like never before.
        </p>
        <a
          href="#"
          className="bg-white text-blue-700 font-bold px-8 py-3 rounded-lg shadow hover:bg-gray-200 transition"
        >
          Sign In with Google
        </a>
      </section>
    </>
  );
}
