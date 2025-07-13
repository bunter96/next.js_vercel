import { useState, useMemo } from "react";
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { account } from '../lib/appwriteConfig';
import { toast } from 'react-hot-toast';

// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getAllUniqueFeatures = (plans) => {
  const features = new Set();
  plans.forEach(plan => {
    plan.features.forEach(feature => features.add(feature));
  });
  return Array.from(features);
};

// Plan data
const plans = [
  {
    title: "Starter",
    monthly: formatCurrency(9),
    yearly: formatCurrency(86), // 20% discount on $9*12
    frequencyMonthly: "/mo",
    frequencyYearly: "/yr",
    description: "Perfect for individuals starting out",
    features: [
      "50,000 monthly credits",
      "Voice cloning",
      "Numbe of Hours speech",
      "Audio Download",
      "Characters per conversion",
    ],
    cta: "Get Started",
    featured: false,
    monthlyId: process.env.REACT_APP_STRIPE_STARTER_MONTHLY || "prod_3d6z0m8mKmzuV6LvPwc0jf",
    yearlyId: process.env.REACT_APP_STRIPE_STARTER_YEARLY || "prod_3hWM6T8Iu8GZsUFsyQgrnB",
  },
  {
    title: "Pro",
    monthly: formatCurrency(29),
    yearly: formatCurrency(278), // 20% discount on $29*12
    frequencyMonthly: "/mo",
    frequencyYearly: "/yr",
    description: "Ideal for growing teams and businesses",
    features: [
      "100,000 monthly credits",
      "Voice cloning",
      "Numbe of Hours speech",
      "Analytics",
      "Audio Download",
      "Commercial use",
      "Characters per conversion",
      "Generated file storage",
    ],
    cta: "Upgrade Now",
    featured: true,
    monthlyId: process.env.REACT_APP_STRIPE_PRO_MONTHLY || "prod_1308g86Vz0IIqbZgpPa9o4",
    yearlyId: process.env.REACT_APP_STRIPE_PRO_YEARLY || "prod_1B1DSJwW6nBTYgQYFsxP7",
  },
  {
    title: "Turbo",
    monthly: formatCurrency(50),
    yearly: formatCurrency(480), // 20% discount on $50*12
    frequencyMonthly: "/mo",
    frequencyYearly: "/yr",
    description: "High-performance plan for scaling businesses",
    features: [
      "300,000 monthly credits",
      "Voice cloning",
      "Numbe of Hours speech",
      "Analytics",
      "Audio Download",
      "Commercial use",
      "Characters per conversion",
      "Generated file storage",
      "Priority generation",
      "Enhance reference audio",
    ],
    cta: "Get Turbo",
    featured: false,
    monthlyId: process.env.REACT_APP_STRIPE_TURBO_MONTHLY || "prod_xNBLeAW61WSH5dmRcBxPP",
    yearlyId: process.env.REACT_APP_STRIPE_TURBO_YEARLY || "prod_23qN6cgjlpiCtD3OfY2JqH",
  },
];


// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.25, delayChildren: 0.4 } },
};

const itemVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 12, mass: 0.8 } },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 80 } },
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)" },
  tap: { scale: 0.95 },
};

const faqVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
};

// FAQ data
const faqs = [
  {
    question: "What is the difference between monthly and yearly billing?",
    answer: "Monthly billing charges you each month, offering flexibility to cancel anytime. Yearly billing charges annually and offers a 20% discount compared to monthly billing.",
  },
  {
    question: "Can I upgrade or downgrade my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time through your account settings. Changes take effect at the start of the next billing cycle.",
  },
  {
    question: "Is there a free trial available?",
    answer: "We currently do not offer a free trial, but you can contact our support team to discuss your needs and explore our plans.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, including Visa, MasterCard, and American Express, as well as select digital payment methods.",
  },
  {
    question: "What happens if I cancel my subscription?",
    answer: "If you cancel, you'll retain access to your plan's features until the end of the current billing period. No refunds are provided for partial periods.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Refunds are not available for subscriptions, but you can cancel anytime to avoid future charges. Contact support for assistance with any issues.",
  },
  {
    question: "How does the Dedicated Account Manager feature work?",
    answer: "With the Turbo plan, a Dedicated Account Manager provides personalized support, helping you optimize your use of our platform and addressing any concerns.",
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(null);
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  // Memoized values
  const memoizedPlans = useMemo(() => plans, []);
  const uniqueFeatures = [
  "Monthly credits",
  "Voice cloning",
  "Numbe of Hours speech",
  "Analytics",
  "Audio Download",
  "Commercial use",
  "Characters per conversion",
  "Generated file storage",
  "Priority generation",
  "Enhance reference audio",
];
  const activePlanId = useMemo(() => user?.active_product_id || null, [user]);

  const handleSubscribe = debounce(async (plan) => {
    if (!user) {
      toast.error("Please log in to subscribe.", { duration: 2500 });
      setTimeout(() => (window.location.href = '/login'), 800);
      return;
    }

    try {
      setLoading(plan.title);
      
      const planId = yearly ? plan.yearlyId : plan.monthlyId;
      if (activePlanId === planId) {
        toast("You're already subscribed to this plan!", { 
          duration: 3000,
          icon: 'ℹ️',
        });
        return;
      }

      const jwtResponse = await account.createJWT();
      if (!jwtResponse?.jwt) throw new Error('Failed to create authentication token');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Appwrite-JWT': jwtResponse.jwt,
        },
        body: JSON.stringify({ 
          planId, 
          billingCycle: yearly ? 'yearly' : 'monthly',
          fullPlanName: `${plan.title} ${yearly ? 'Yearly' : 'Monthly'}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (!url) throw new Error('Missing checkout URL');
      
      window.location.href = url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to start subscription. Please try again.', { 
        duration: 3000,
      });
    } finally {
      setLoading(null);
    }
  }, 300);

  // Runtime prop-type checking in development
  if (process.env.NODE_ENV === 'development') {
    const userPropTypes = {
      active_product_id: PropTypes.string,
    };
    if (user) PropTypes.checkPropTypes(userPropTypes, user, 'user', 'PricingPage');
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 sm:p-12"
    >
      <div className="max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, type: "spring", stiffness: 100 }}
          className="text-4xl sm:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          Find Your Perfect Plan
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
          className="text-gray-700 mb-10 text-lg sm:text-xl max-w-2xl mx-auto"
        >
          From startups to enterprises, we have a plan tailored to your needs with flexible billing options.
        </motion.p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          className="flex justify-center mb-12 items-center gap-4 max-w-sm mx-auto bg-white p-2 rounded-full shadow-lg"
        >
          <button
            onClick={() => setYearly(false)}
            aria-label="Switch to monthly billing"
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${!yearly ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            aria-label="Switch to yearly billing"
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${yearly ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}
          >
            Yearly
          </button>
          {yearly && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green-600 font-medium"
            >
              Save 20%
            </motion.span>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
		  viewport={{ once: true, margin: "100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10"
        >
          {memoizedPlans.map((plan, idx) => {
            const planId = yearly ? plan.yearlyId : plan.monthlyId;
            const isSubscribed = activePlanId === planId;

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: idx * 0.25 }}
                className={`rounded-3xl shadow-xl p-8 flex flex-col items-center text-center bg-white transition-all duration-300 hover:shadow-2xl ${
                  plan.featured
                    ? "border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 transform scale-105 relative overflow-hidden"
                    : ""
                } ${isSubscribed ? "ring-2 ring-green-500 bg-green-50" : ""}`}
                aria-describedby={`plan-${plan.title}-description`}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                )}
                <div className="relative w-full text-center">
                  <div className="flex items-center justify-center gap-3">
                    {isSubscribed && (
                      <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    )}
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">{plan.title}</h2>
                    {plan.featured && (
                      <span className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-4xl font-extrabold mb-2 text-gray-900">
                  {yearly ? plan.yearly : plan.monthly}
                  <span className="text-xl font-normal text-gray-500">
                    {yearly ? plan.frequencyYearly : plan.frequencyMonthly}
                  </span>
                </p>
                <p id={`plan-${plan.title}-description`} className="text-gray-600 mb-6 text-base">
                  {plan.description}
                </p>
                <ul className="text-left space-y-3 mb-8 w-full">
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: shouldReduceMotion ? 0 : 0.3 + i * 0.1 }}
                      className="flex items-center gap-3 text-gray-700 text-base"
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  variants={buttonVariants}
                  whileHover={isSubscribed ? {} : buttonVariants.hover}
                  whileTap={isSubscribed ? {} : buttonVariants.tap}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isSubscribed || loading === plan.title}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center focus:ring-4 focus:ring-indigo-300 ${
                    isSubscribed
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : plan.featured
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                  aria-label={isSubscribed ? `${plan.title} plan is active` : `Subscribe to ${plan.title} plan`}
                >
                  {loading === plan.title ? (
                    <>
                      <svg className="animate-spin h-6 w-6 mr-3 inline-block" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Loading...
                    </>
                  ) : isSubscribed ? (
                    "Subscribed"
                  ) : (
                    plan.cta
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.6 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Compare Features</h2>
          <details className="md:hidden mb-6">
            <summary className="text-xl font-semibold cursor-pointer flex items-center justify-center gap-2">
              Show Feature Comparison
              <ChevronDown className="w-5 h-5" />
            </summary>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mt-4 shadow-lg">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-indigo-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-left font-semibold sticky left-0 bg-indigo-50 z-20 text-gray-900">Feature</th>
                    {memoizedPlans.map((plan, i) => (
                      <th key={i} className="p-4 text-center font-semibold text-gray-900">
                        {plan.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniqueFeatures.map((feature, i) => (
                    <motion.tr
                      key={i}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: shouldReduceMotion ? 0 : i * 0.1 + 0.5 }}
                      className="border-t even:bg-gray-50"
                    >
                      <td className="p-4 text-left font-medium sticky left-0 bg-white z-10">
                        {feature}
                      </td>
                      {memoizedPlans.map((plan, j) => (
                        <td key={j} className="p-4 text-center">
                          {plan.features.includes(feature) ? (
                            <CheckCircle2 className="inline-block text-green-500 w-6 h-6" />
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-indigo-50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-left font-semibold sticky left-0 bg-indigo-50 z-20 text-gray-900">Feature</th>
                  {memoizedPlans.map((plan, i) => (
                    <th key={i} className="p-4 text-center font-semibold text-gray-900">
                      {plan.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uniqueFeatures.map((feature, i) => (
                  <motion.tr
                    key={i}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: shouldReduceMotion ? 0 : i * 0.1 + 0.5 }}
                    className="border-t even:bg-gray-50"
                  >
					<td className="p-4 font-medium text-left sticky left-0 bg-white z-10">
					  {feature}
					</td>
                    {memoizedPlans.map((plan, j) => (
                      <td key={j} className="p-4 text-center">
                        {plan.features.includes(feature) ? (
                          <CheckCircle2 className="inline-block text-green-500 w-6 h-6" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

		<motion.section className="mt-20">
		  <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
			Frequently Asked Questions
		  </h2>
		  <div className="max-w-3xl mx-auto space-y-1">
			{faqs.map((faq, i) => {
			  const [isOpen, setIsOpen] = useState(false);
			  
			  return (
				<div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
				  <button
					onClick={() => setIsOpen(!isOpen)}
					className="w-full p-6 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
					aria-expanded={isOpen}
				  >
					<h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
					<div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
					  <ChevronDown className="w-5 h-5 text-indigo-600" />
					</div>
				  </button>
				  
				  <div 
					className={`overflow-hidden transition-all duration-100 ${isOpen ? 'max-h-[500px] opacity-100 pb-6 px-6' : 'max-h-0 opacity-0'}`}
					style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
				  >
					<p className="text-gray-600">{faq.answer}</p>
				  </div>
				</div>
			  );
			})}
		  </div>
		</motion.section>

      </div>
    </motion.section>
  );
}

// PropTypes for development
PricingPage.propTypes = {
  // Add any props if this component receives any
};