import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { account } from '../lib/appwriteConfig';
import { toast } from 'react-hot-toast';

const plans = [
  {
    title: "Starter",
    monthly: "$9",
    yearly: "$90",
    frequency: "/mo",
    description: "Perfect for individuals starting out.",
    features: ["1 Project", "Basic Analytics", "Email Support"],
    cta: "Get Started",
    featured: false,
    monthlyId: "prod_3d6z0m8mKmzuV6LvPwc0jf",
    yearlyId: "prod_3hWM6T8Iu8GZsUFsyQgrnB",
  },
  {
    title: "Pro",
    monthly: "$29",
    yearly: "$290",
    frequency: "/mo",
    description: "Ideal for growing teams and businesses.",
    features: [
      "10 Projects",
      "Advanced Analytics",
      "Priority Email Support",
      "Team Collaboration",
    ],
    cta: "Upgrade Now",
    featured: true,
    monthlyId: "prod_1308g86Vz0IIqbZgpPa9o4",
    yearlyId: "prod_1B1DSJwW6nBTYgQYFsxP7",
  },
  {
    title: "Turbo",
    monthly: "$50",
    yearly: "$500",
    frequency: "/mo",
    description: "High-performance plan for scaling businesses.",
    features: [
      "Unlimited Projects",
      "Advanced Analytics",
      "24/7 Priority Support",
      "Team Collaboration",
      "Dedicated Account Manager",
    ],
    cta: "Get Turbo",
    featured: false,
    monthlyId: "prod_xNBLeAW61WSH5dmRcBxPP",
    yearlyId: "prod_23qN6cgjlpiCtD3OfY2JqH",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(null);
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const memoizedPlans = useMemo(() => plans, []);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSubscribe = debounce(async (plan) => {
    if (!user) {
      toast.error("Please log in to subscribe.", { duration: 4000 });
      setTimeout(() => (window.location.href = '/login'), 1000);
      return;
    }

    const planId = yearly ? plan.yearlyId : plan.monthlyId;
    if (user?.active_product_id === planId) {
      toast("You're already subscribed to this plan!", { duration: 3000 });
      return;
    }

    setLoading(plan.title);
    try {
      const billingCycle = yearly ? 'yearly' : 'monthly';
      const fullPlanName = `${plan.title} ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}`;

      const jwtResponse = await account.createJWT();
      const jwt = jwtResponse.jwt;

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Appwrite-JWT': jwt,
        },
        body: JSON.stringify({ 
          planId, 
          billingCycle,
          fullPlanName,
        }),
      });

      const { url } = await response.json();
      if (!response.ok) throw new Error('Failed to create checkout session');

      window.location.href = url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription. Please try again.', { duration: 4000 });
    } finally {
      setLoading(null);
    }
  }, 300);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-4 sm:p-10"
    >
      <div className="max-w-6xl mx-auto text-center">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          className="text-3xl sm:text-4xl font-bold mb-4"
        >
          Choose the plan that&apos;s right for you
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
          className="text-gray-600 mb-8 text-base sm:text-lg"
        >
          Whether you&apos;re just getting started or scaling your business, we&apos;ve got a plan for you.
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          className="flex justify-center mb-12 items-center gap-4 max-w-xs mx-auto"
        >
          <button
            onClick={() => setYearly(!yearly)}
            aria-label={`Switch to ${yearly ? 'monthly' : 'yearly'} billing`}
            className="bg-gray-200 text-gray-900 px-6 py-2 rounded-full shadow-inner transition-colors hover:bg-gray-400 focus:ring-2 focus:ring-blue-500"
          >
            {yearly ? "Switch to Monthly" : "Switch to Yearly"}
          </button>
          {yearly && <span className="text-sm text-green-600">Save up to 20%</span>}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {memoizedPlans.map((plan, idx) => {
            const planId = yearly ? plan.yearlyId : plan.monthlyId;
            const isSubscribed = user?.active_product_id === planId;

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3, delay: idx * 0.15 }}
                className={`rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-all ${
                  plan.featured
                    ? "border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-white transform scale-105"
                    : "bg-white"
                } ${isSubscribed ? "ring-2 ring-green-500 bg-green-50" : ""}`}
                aria-describedby={`plan-${plan.title}-description`}
              >
                <div className="relative w-full text-center">
                  <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>
                  {plan.featured && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      Recommended
                    </span>
                  )}
                  {isSubscribed && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold mb-1">
                  {yearly ? plan.yearly : plan.monthly}
                  <span className="text-lg font-normal text-gray-500">{plan.frequency}</span>
                </p>
                <p id={`plan-${plan.title}-description`} className="text-gray-600 arials mb-6">
                  {plan.description}
                </p>
                <ul className="text-left space-y-2 mb-6 w-full">
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: shouldReduceMotion ? 0 : 0.2 + i * 0.05 }}
                      className="flex items-center gap-2 text-gray-700 text-base"
                    >
                      <span aria-hidden="true">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </span>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: isSubscribed ? 1 : 1.05 }}
                  whileTap={{ scale: isSubscribed ? 1 : 0.95 }}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isSubscribed || loading === plan.title}
                  className={`w-full py-2 px-4 rounded-md font-semibold transition-colors flex items-center justify-center focus:ring-2 focus:ring-blue-500 ${
                    isSubscribed
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : plan.featured
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-400'
                  }`}
                  aria-label={isSubscribed ? `${plan.title} plan is active` : `Subscribe to ${plan.title} plan`}
                >
                  {loading === plan.title ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 inline-block" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.4 }}
          className="mt-20"
        >
          <h2 className="text-2xl font-bold mb-6">Compare Features</h2>
          <details className="md:hidden mb-4">
            <summary className="text-lg font-semibold cursor-pointer">Show Feature Comparison</summary>
            <div className="overflow-x-auto rounded-lg border mt-2">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left font-semibold sticky left-0 bg-gray-50 z-20">Feature</th>
                    {memoizedPlans.map((plan, i) => (
                      <th key={i} className="p-3 text-center font-semibold">
                        {plan.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    "Basic Analytics",
                    "Advanced Analytics",
                    "Team Collaboration",
                    "24/7 Priority Support",
                    "Dedicated Account Manager",
                    "Unlimited Projects",
                    "Email Support",
                    "Priority Email Support",
                    "1 Project",
                    "10 Projects",
                  ].map((feature, i) => (
                    <motion.tr
                      key={i}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 + 0.4 }}
                      className="border-t even:bg-gray-50"
                    >
                      <td className="p-3 font-medium sticky left-0 bg-white z-10">
                        {feature === "Dedicated Account Manager" ? (
                          <span className="font-bold text-blue-600">{feature}</span>
                        ) : (
                          feature
                        )}
                      </td>
                      {memoizedPlans.map((plan, j) => (
                        <td key={j} className="p-3 text-center">
                          {plan.features.includes(feature) ? (
                            <span aria-hidden="true">
                              <CheckCircle2 className="inline-block text-green-500 w-5 h-5" />
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <div className="hidden md:block overflow-x-auto rounded-lg border">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left font-semibold sticky left-0 bg-gray-50 z-20">Feature</th>
                  {memoizedPlans.map((plan, i) => (
                    <th key={i} className="p-3 text-center font-semibold">
                      {plan.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "Basic Analytics",
                  "Advanced Analytics",
                  "Team Collaboration",
                  "24/7 Priority Support",
                  "Dedicated Account Manager",
                  "Unlimited Projects",
                  "Email Support",
                  "Priority Email Support",
                  "1 Project",
                  "10 Projects",
                ].map((feature, i) => (
                  <motion.tr
                    key={i}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 + 0.4 }}
                    className="border-t even:bg-gray-50"
                  >
                    <td className="p-3 font-medium sticky left-0 bg-white z-10">
                      {feature === "Dedicated Account Manager" ? (
                        <span className="font-bold text-blue-600">{feature}</span>
                      ) : (
                        feature
                      )}
                    </td>
                    {memoizedPlans.map((plan, j) => (
                      <td key={j} className="p-3 text-center">
                        {plan.features.includes(feature) ? (
                          <span aria-hidden="true">
                            <CheckCircle2 className="inline-block text-green-500 w-5 h-5" />
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-gray-600">
            Not sure which plan?{' '}
            <a href="/faq" className="text-blue-600 hover:underline">
              Explore our FAQ
            </a>
          </p>
        </motion.section>
      </div>
    </motion.section>
  );
}