import { useState } from 'react';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      price: {
        monthly: '$19',
        annual: '$15',
      },
      description: 'Perfect for individual developers',
      features: [
        '1 Project',
        '5GB Storage',
        'Basic Analytics',
        'Email Support',
        'API Access',
      ],
      recommended: false,
    },
    {
      name: 'Professional',
      price: {
        monthly: '$49',
        annual: '$39',
      },
      description: 'Best for small teams',
      features: [
        '5 Projects',
        '20GB Storage',
        'Advanced Analytics',
        'Priority Email Support',
        'API Access',
        'Webhooks',
      ],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: {
        monthly: '$99',
        annual: '$79',
      },
      description: 'For large organizations',
      features: [
        'Unlimited Projects',
        '100GB Storage',
        'Advanced Analytics',
        '24/7 Support',
        'API Access',
        'Webhooks',
        'Custom SLAs',
        'Dedicated Account Manager',
      ],
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Pricing Plans
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Start building for free, then add a site plan to go live. Account plans unlock
            additional features.
          </p>
          
          {/* Toggle switch */}
          <div className="mt-6 flex justify-center items-center">
            <span className={`mr-3 text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`ml-3 text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Annual</span>
          </div>
        </div>

        <div className="mt-16 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:space-y-0">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 bg-white border rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg ${
                plan.recommended ? 'border-indigo-500' : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most popular
                  </span>
                </div>
              )}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-2 text-gray-500">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-base font-medium text-gray-500">/{isAnnual ? 'year' : 'mo'}</span>
                </p>
                <button
                  className={`mt-8 w-full px-6 py-3 border border-transparent text-base font-medium rounded-md ${
                    plan.recommended
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  Get started
                </button>
              </div>
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">What&rsquo;s included</h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="flex-shrink-0 w-6 h-6 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Need something custom?{' '}
            <a href="#" className="text-indigo-600 font-medium hover:text-indigo-500">
              Contact sales
            </a>
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            30-day money back guarantee • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}