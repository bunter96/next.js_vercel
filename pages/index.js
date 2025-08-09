// pages/index.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import {
  ShieldCheckIcon,
  PresentationChartLineIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  CpuChipIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ServerIcon,
  GlobeAltIcon,
  BookOpenIcon,
  MegaphoneIcon,
  BriefcaseIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { CheckCircle2 } from "lucide-react";

const useCases = [
  {
    icon: MusicalNoteIcon,
    title: "Content Creators",
    desc: "Create engaging voice-overs for your YouTube videos, podcasts, and social media content in minutes with natural-sounding voices that keep your audience hooked.",
    color: "bg-rose-100 text-rose-600 dark:bg-rose-700 dark:text-rose-200"
  },
  {
    icon: PresentationChartLineIcon,
    title: "Educators & Trainers",
    desc: "Develop accessible e-learning modules, instructional videos, and audio-based lesson plans that cater to all learning styles and improve comprehension.",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-700 dark:text-blue-200"
  },
  {
    icon: MegaphoneIcon,
    title: "Marketers",
    desc: "Produce professional voice-overs for advertisements, promotional videos, and presentations that capture attention and drive your message home.",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-700 dark:text-amber-200"
  },
  {
    icon: BookOpenIcon,
    title: "Authors & Publishers",
    desc: "Turn your written work into compelling audiobooks and reach a wider audience. Effortlessly convert manuscripts into high-quality audio productions.",
    color: "bg-green-100 text-green-600 dark:bg-green-700 dark:text-green-200"
  },
  {
    icon: BriefcaseIcon,
    title: "Business Professionals",
    desc: "Enhance corporate training materials, create voice-overs for presentations, and produce professional internal announcements with a consistent brand voice.",
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-700 dark:text-indigo-200"
  },
  {
    icon: UserGroupIcon,
    title: "Personal Use",
    desc: "Listen to articles while on the go, proofread your writing by hearing it aloud, or use it as an accessibility tool to consume written content effortlessly.",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-700 dark:text-purple-200"
  }
];

// Animation variants for the static sound wave
const waveHeights = [40, 75, 60, 90, 50, 70, 85, 65, 45, 80, 55, 70];
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};
const barVariants = {
  hidden: { height: "10%", opacity: 0 },
  visible: (custom) => ({
    height: `${custom}%`,
    opacity: 1,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  }),
};


export default function Home() {
  const [selectedTab, setSelectedTab] = useState(useCases[0]);

  return (
    // Base background for the entire page
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden
                    dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
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
            className="w-24 h-24 bg-indigo-500/20 rounded-full absolute -top-10 -left-10
                      dark:bg-indigo-700/20"
          ></motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-36 h-36 bg-purple-500/20 rounded-full absolute -bottom-10 -right-10
                      dark:bg-purple-700/20"
          ></motion.div>
          
          <h1 className="flex flex-col text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100
            dark:from-gray-200 dark:to-gray-50">
            <span>Studio Quality AI Voice Generation</span>
            <span className="mt-2 md:mt-4 lg:mt-6 text-white dark:text-gray-200">Platform</span>
          </h1>

          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-indigo-100 dark:text-gray-300"
          >
            Experience natural, human-like speech generation &mdash; without the premium price tag. Affordable, fast, and powerful
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
      
      {/* Multi-Language Section - Two Column Layout */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-700 rounded-full mb-4">
                <GlobeAltIcon className="h-8 w-8 text-green-600 dark:text-green-200" />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Speak to the World, in 13 Languages</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Our AI currently supports 13 of the world&apos;s most spoken languages, including English, Japanese, Spanish, and Arabic. Connect with a global audience with authentic, high-quality voices.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="grid grid-cols-4 sm:grid-cols-5 gap-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {[
                  'us', 'cn', 'jp', 'kr', 'fr', 
                  'de', 'sa', 'es', 'ru', 'nl', 
                  'it', 'pl', 'pt'
                ].map((countryCode) => (
                  <motion.div
                    key={countryCode}
                    className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
                    variants={{
                      hidden: { opacity: 0, scale: 0.5 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <img
                      src={`https://flagcdn.com/w80/${countryCode}.png`}
                      alt={`${countryCode} flag`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>
      
      {/* Voice Cloning Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="md:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 mb-4">
                <SparklesIcon className="h-10 w-10 mr-3" />
                <span className="text-sm font-bold tracking-widest uppercase">Powerful AI Feature</span>
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-6 dark:text-white">Instant Voice Cloning with Zero-Shot AI</h3>
              <p className="text-lg text-gray-600 mb-8 dark:text-gray-300">
                Create a perfect, high-fidelity digital replica of any voice from just a few seconds of audio. Our advanced zero-shot technology offers unparalleled performance and efficiency, no lengthy training required.
              </p>
              <ul className="space-y-4">
                {[
                  "Capture unique timbre and emotion accurately.",
                  "Clone voices across all 13 supported languages.",
                  "Generate audio in real-time with ultra-low latency.",
                  "Built-in safeguards for ethical and responsible use.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              className="md:order-1"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl relative aspect-square flex items-center justify-center">
                 <div className="absolute inset-4 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 rounded-xl blur-2xl"></div>
                 <div className="relative text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                        <MusicalNoteIcon className="h-12 w-12 text-white"/>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">Original Audio Snippet</p>
                    <ArrowPathIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 my-6 mx-auto animate-spin" style={{ animationDuration: '3s' }}/>
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center shadow-lg">
                        <CpuChipIcon className="h-12 w-12 text-white"/>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 mt-4">High-Fidelity AI Voice</p>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-4 dark:bg-indigo-700 dark:text-indigo-200">
            Key Features
          </span>
          <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Powerful Audio Intelligence
          </h3>
			<p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
			  Transform your text into high-quality, impactful audio content
			</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[{
            icon: MusicalNoteIcon,
            title: "Natural Sounding Voices",
            desc: "Access a library of high-quality, human-like AI voices for your projects.",
            color: "bg-purple-100 text-purple-600 dark:bg-purple-700 dark:text-purple-200"
          }, {
            icon: ShieldCheckIcon,
            title: "Secure & Private",
            desc: "Your data is protected with end-to-end encryption and secure infrastructure.",
            color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-700 dark:text-indigo-200"
          }, {
            icon: CpuChipIcon,
            title: "AI Voice Cloning",
            desc: "Create a digital replica of your own voice for consistent branding.",
            color: "bg-blue-100 text-blue-600 dark:bg-blue-700 dark:text-blue-200"
          }, {
            icon: GlobeAltIcon,
            title: "Multi-language Support",
            desc: "Generate speech in 13+ major languages and regional accents.",
            color: "bg-green-100 text-green-600 dark:bg-green-700 dark:text-green-200"
          }, {
            icon: ArrowPathIcon,
            title: "History",
            desc: "Access and manage all your previously generated audio files.",
            color: "bg-amber-100 text-amber-600 dark:bg-amber-700 dark:text-amber-200"
          }, {
            icon: PresentationChartLineIcon,
            title: "Dashboards",
            desc: "Track your audio generation usage and get insights with our dashboards.",
            color: "bg-rose-100 text-rose-600 dark:bg-rose-700 dark:text-rose-200"
          }].map((item, index) => (
            <motion.div
              key={index}
              className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-transparent hover:shadow-xl transition-all
                         dark:bg-gray-800 dark:border-gray-700 dark:hover:border-transparent dark:hover:shadow-2xl"
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

      {/* Use Cases Section - Tabbed Layout */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4 dark:bg-purple-700 dark:text-purple-200">
              For Every Voice
            </span>
            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Who Can Use Our Platform?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Our versatile text-to-speech platform is designed for a wide range of creators and professionals. Select a role to see how it can work for you.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 min-h-[20rem]">
            {/* Vertical Tabs */}
            <ul className="flex flex-row md:flex-col items-start md:border-r border-gray-200 dark:border-gray-700 -mx-4 px-4 md:pr-8 md:pl-0 overflow-x-auto">
              {useCases.map((item) => (
                <li
                  key={item.title}
                  className="group relative px-4 py-3 whitespace-nowrap cursor-pointer text-lg font-medium rounded-lg transition-colors w-full text-left"
                  onClick={() => setSelectedTab(item)}
                >
                  <span className={`transition-colors ${item.title === selectedTab.title ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-100'}`}>
                    {item.title}
                  </span>
                  {item.title === selectedTab.title && (
                    <motion.div
                      className="absolute bottom-0 md:top-0 md:-right-1 h-1 md:h-full w-full md:w-1 bg-indigo-600 rounded-full"
                      layoutId="active-use-case"
                    />
                  )}
                </li>
              ))}
            </ul>

            {/* Content Pane */}
            <div className="relative flex-grow">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTab ? selectedTab.title : 'empty'}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full absolute inset-0"
                >
                  <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-2xl">
                    <div className="flex items-start gap-6">
                      <div className={`flex-shrink-0 w-16 h-16 ${selectedTab.color} rounded-lg flex items-center justify-center`}>
                        <selectedTab.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">{selectedTab.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">{selectedTab.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
		
      {/* CTA Section - Two Column with Visual */}
      <section className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <motion.div 
              className="text-center md:text-left"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:bg-none dark:text-white">
                Unlock Premium Voices at an Affordable Price
              </h2>
              <Link
                href="/pricing"
                className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                View Pricing Plans
              </Link>
            </motion.div>

            <motion.div 
              className="hidden md:flex justify-center items-end gap-2 h-48"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {waveHeights.map((height, i) => (
                <motion.div
                  key={i}
                  custom={height}
                  variants={barVariants}
                  className="w-4 bg-gradient-to-t from-indigo-400 to-purple-400 rounded-lg"
                />
              ))}
            </motion.div>

          </div>
        </div>
      </section>

    {/*
		<section className="bg-white py-20 px-4 dark:bg-gray-900 transition-colors duration-300">
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
			  initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
			  className="bg-white rounded-xl shadow-lg overflow-hidden dark:bg-gray-800 dark:shadow-2xl"
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
						fishAudio: "13 languages",
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
					  <tr 
						key={index}
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
					  </tr>
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
    */}
		
    </div>
  );
}