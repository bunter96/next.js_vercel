// pages/index.js
import { motion } from "framer-motion";
import Link from 'next/link';
import {
  ShieldCheckIcon,
  PresentationChartLineIcon,
  MusicalNoteIcon,
  LockClosedIcon,
  UserGroupIcon,
  CpuChipIcon,
  SparklesIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ServerIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    // Base background for the entire page, will be overridden by sections but good fallback
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 dark:opacity-5"></div>
        <motion.div
          className="max-w-7xl mx-auto px-4 py-32 text-center relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-indigo-500/20 rounded-full absolute -top-10 -left-10"
          ></motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-36 h-36 bg-purple-500/20 rounded-full absolute -bottom-10 -right-10"
          ></motion.div>
          
          <h1 className="flex flex-col text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">
            <span>Studio Quality AI Voice Generation</span>
            <span className="mt-2 md:mt-4 lg:mt-6 text-white">Platform</span>
          </h1>

          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-indigo-100"
          >
            Experience natural, human-like speech generation — without the premium price tag. Affordable, fast, and powerful
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center justify-center bg-white text-indigo-600 font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl
                         dark:bg-indigo-700 dark:text-white dark:hover:bg-indigo-800"
            >
              Get Started
            </motion.a>
            <motion.a
              href="#features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Explore Features
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* Logo Cloud Section - New */}
      <section className="py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-500 mb-8 dark:text-gray-400">Trusted by innovative teams worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center">
            {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-center text-gray-700 font-bold text-xl dark:text-gray-300"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Enhanced */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Revolutionizing Audio Analysis
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 text-lg md:text-xl"
          >
            Fish Audio is a full-stack web platform that uses advanced machine learning to provide real-time audio analysis.
            Our secure, scalable solution delivers deep insights into your audio content with enterprise-grade reliability.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: ArrowPathIcon, title: "Real-time Processing", desc: "Analyze audio streams with <50ms latency" },
              { icon: ChartBarIcon, title: "Advanced Analytics", desc: "Comprehensive audio metrics and visualization" },
              { icon: ServerIcon, title: "Enterprise Scale", desc: "Process millions of hours of audio daily" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-700 dark:hover:shadow-2xl transition-colors duration-300"> {/* Dark mode background and hover shadow */}
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto dark:bg-indigo-700">
                  <item.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-100">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-4 dark:bg-indigo-700 dark:text-indigo-200"> {/* Dark mode colors */}
            Key Features
          </span>
          <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"> {/* Dark mode text */}
            Powerful Audio Intelligence
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Discover how Fish Audio transforms your audio data into actionable insights
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[{
            icon: MusicalNoteIcon,
            title: "Real-time Analysis",
            desc: "Visualize audio data live as it streams with our low-latency API",
            color: "bg-purple-100 text-purple-600 dark:bg-purple-700 dark:text-purple-200" // Dark mode colors
          }, {
            icon: ShieldCheckIcon,
            title: "Enterprise Security",
            desc: "End-to-end encryption with JWT auth and role-based access",
            color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-700 dark:text-indigo-200" // Dark mode colors
          }, {
            icon: CpuChipIcon,
            title: "AI Processing",
            desc: "Advanced machine learning models for audio classification",
            color: "bg-blue-100 text-blue-600 dark:bg-blue-700 dark:text-blue-200" // Dark mode colors
          }, {
            icon: GlobeAltIcon,
            title: "Multi-language",
            desc: "Support for 50+ languages and regional accents",
            color: "bg-green-100 text-green-600 dark:bg-green-700 dark:text-green-200" // Dark mode colors
          }, {
            icon: UserGroupIcon,
            title: "Collaboration",
            desc: "Share projects and annotations with your team",
            color: "bg-amber-100 text-amber-600 dark:bg-amber-700 dark:text-amber-200" // Dark mode colors
          }, {
            icon: PresentationChartLineIcon,
            title: "Dashboards",
            desc: "Customizable analytics dashboards with export",
            color: "bg-rose-100 text-rose-600 dark:bg-rose-700 dark:text-rose-200" // Dark mode colors
          }].map((item, index) => (
            <motion.div
              key={index}
              className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-transparent hover:shadow-xl transition-all
                         dark:bg-gray-800 dark:border-gray-700 dark:hover:border-transparent dark:hover:shadow-2xl transition-colors duration-300" // Dark mode backgrounds, borders, and shadows
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-100">{item.title}</h4>
              <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section - New */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10M+", label: "Audio Files Processed" },
              { number: "99.9%", label: "Uptime" },
              { number: "50+", label: "Languages Supported" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <LockClosedIcon className="h-12 w-12 text-indigo-600 mb-4 dark:text-indigo-400" />
              <h3 className="text-3xl font-extrabold text-gray-900 mb-6 dark:text-gray-100">Enterprise-grade Security</h3>
              <p className="text-lg text-gray-600 mb-6 dark:text-gray-300"> {/* Dark mode text */}
                We built Fish Audio with security as the foundation. From encrypted sessions to strict CORS policies, 
                every layer is designed to protect your data.
              </p>
              <ul className="space-y-4">
                {[
                  "End-to-end encryption",
                  "GDPR & CCPA compliant",
                  "Regular security audits",
                  "Role-based access control",
                  "Data residency options"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              className="md:w-1/2 bg-gray-100 rounded-xl overflow-hidden shadow-lg dark:bg-gray-700 dark:shadow-2xl transition-colors duration-300"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 p-8 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 w-full">
                  <div className="space-y-4">
                    {['Data Encryption', 'Access Logs', 'Session Management', 'API Security'].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-white/90">{item}</span>
                        <div className="h-2 bg-white/20 rounded-full w-3/4">
                          <div 
                            className="h-full bg-white rounded-full" 
                            style={{ width: `${75 + (i * 7)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
		
		
		<section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20 px-4 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
		  <div className="max-w-7xl mx-auto">
			<div className="text-center mb-16">
			  <motion.h3 
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
			  >
				Compare Our Pricing
			  </motion.h3>
			  <motion.p
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.2 }}
				className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg"
			  >
				See how Fish Audio provides better value than the competition
			  </motion.p>
			</div>

			<motion.div
			  initial={{ opacity: 0 }}
			  whileInView={{ opacity: 1 }}
			  viewport={{ once: true }}
			  className="bg-white rounded-xl shadow-lg overflow-hidden dark:bg-gray-800 dark:shadow-2xl transition-colors duration-300"
			>
			  <div className="overflow-x-auto">
				<table className="w-full table-auto border-collapse">
				  <thead>
					<tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
					  <th className="p-4 text-left font-semibold rounded-tl-xl">Feature</th>
					  <th className="p-4 font-semibold text-center">Fish Audio</th>
					  <th className="p-4 font-semibold text-center">ElevenLabs</th>
					  <th className="p-4 font-semibold text-center">Descript</th>
					  <th className="p-4 font-semibold text-center rounded-tr-xl">Rev.com</th>
					</tr>
				  </thead>
				  <tbody>
					{[
					  {
						feature: "Basic Plan Price",
						fishAudio: "$9/month",
						elevenLabs: "$22/month",
						descript: "$15/month",
						rev: "$20/month",
						highlight: true
					  },
					  {
						feature: "Advanced Features",
						fishAudio: "Included",
						elevenLabs: "Extra $10/month",
						descript: "Limited",
						rev: "Extra $15/month"
					  },
					  {
						feature: "Free Tier",
						fishAudio: "Yes (2hrs/month)",
						elevenLabs: "No",
						descript: "Yes (1hr/month)",
						rev: "No"
					  },
					  {
						feature: "Real-time Processing",
						fishAudio: "Yes (<50ms latency)",
						elevenLabs: "No",
						descript: "Limited (500ms+)",
						rev: "No"
					  },
					  {
						feature: "Languages Supported",
						fishAudio: "50+ languages",
						elevenLabs: "30 languages",
						descript: "20 languages",
						rev: "10 languages"
					  },
					  {
						feature: "Maximum File Size",
						fishAudio: "10GB",
						elevenLabs: "2GB",
						descript: "1GB",
						rev: "500MB",
						lastRow: true
					  }
					].map((row, index) => (
					  <motion.tr 
						key={index}
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
						viewport={{ once: true }}
						className={`border-t border-gray-200 dark:border-gray-700 ${row.lastRow ? 'rounded-b-xl' : ''}`}
					  >
						<td className={`p-4 font-medium text-gray-900 dark:text-gray-100 ${row.lastRow ? 'rounded-bl-xl' : ''}`}>{row.feature}</td>
						<td className="p-4 text-center font-semibold">
						  {row.highlight ? (
							<span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full dark:bg-indigo-700 dark:text-indigo-200">{row.fishAudio}</span>
						  ) : (
							<span className="text-indigo-600 dark:text-indigo-400">{row.fishAudio}</span>
						  )}
						</td>
						<td className="p-4 text-center text-gray-700 dark:text-gray-300">{row.elevenLabs}</td>
						<td className="p-4 text-center text-gray-700 dark:text-gray-300">{row.descript}</td>
						<td className={`p-4 text-center text-gray-700 dark:text-gray-300 ${row.lastRow ? 'rounded-br-xl' : ''}`}>{row.rev}</td>
					  </motion.tr>
					))}
				  </tbody>
				</table>
			  </div>
			</motion.div>

			<motion.div 
			  className="mt-12 text-center"
			  initial={{ opacity: 0, y: 20 }}
			  whileInView={{ opacity: 1, y: 0 }}
			  viewport={{ once: true }}
			>
			<Link
			  href="/pricing"
			  className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
			>
			  Go to pricing page
			</Link>
			</motion.div>
		  </div>
		</section>
		
    </div>
  );
}