// app/about/page.js
import Image from 'next/image';
import { FaGithub, FaTwitter, FaLinkedin, FaMicrophone, FaRobot, FaRegLightbulb } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6 bg-indigo-100 rounded-full p-4">
            <FaMicrophone className="text-indigo-600 text-3xl" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-indigo-600">LowCost TTS</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforming written content into natural-sounding speech with cutting-edge artificial intelligence.
          </p>
        </div>

        {/* Value Proposition */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-indigo-600 mb-4">
              <FaRobot className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced AI Technology</h3>
            <p className="text-gray-600">
              Our proprietary neural networks deliver the most natural-sounding speech synthesis available today.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-indigo-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Always Improving</h3>
            <p className="text-gray-600">
              Our models learn continuously from new data to provide ever-improving voice quality.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-indigo-600 mb-4">
              <FaRegLightbulb className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Simple Integration</h3>
            <p className="text-gray-600">
              Easy-to-use API and plugins for developers, with no technical knowledge required for basic use.
            </p>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="md:flex items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Technology</h2>
              <p className="text-gray-600 mb-6">
                LowCost TTS uses state-of-the-art deep learning models trained on thousands of hours of human speech.
                We've perfected the subtle nuances that make synthetic speech sound truly human.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium">Neural TTS</span> - Generates speech with human-like intonation
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium">Emotion Control</span> - Adjust tone for different contexts
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium">Multilingual</span> - Supports 30+ languages and dialects
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-indigo-50 flex items-center justify-center">
                <Image
                  src="/ai-voice-generator.png"
                  alt="AI voice technology"
                  width={500}
                  height={300}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Who Uses LowCost TTS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase) => (
              <div key={useCase.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-indigo-100 flex items-center justify-center">
                  <useCase.icon className={`text-4xl ${useCase.color}`} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-indigo-600 rounded-2xl shadow-xl p-8 mb-16 text-white">
          <h2 className="text-3xl font-bold text-center mb-12">Voice in Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2">10M+</p>
              <p className="text-indigo-100">Words Processed Daily</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">50+</p>
              <p className="text-indigo-100">Voice Options</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">99.5%</p>
              <p className="text-indigo-100">Accuracy Rate</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Text to Speech?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of creators, developers, and businesses using LowCost TTS today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/login"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Join Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample use cases data
const useCases = [
  {
    id: 1,
    title: "Content Creators",
    description: "Turn blog posts into podcasts or create voiceovers for videos effortlessly.",
    icon: FaMicrophone,
    color: "text-purple-600"
  },
  {
    id: 2,
    title: "Developers",
    description: "Integrate natural voice responses into your applications with our API.",
    icon: FaRobot,
    color: "text-blue-600"
  },
  {
    id: 3,
    title: "Educators",
    description: "Make learning materials accessible with high-quality audio versions.",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    color: "text-green-600"
  },
];