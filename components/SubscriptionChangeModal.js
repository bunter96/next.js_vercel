// components/SubscriptionChangeModal.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function SubscriptionChangeModal({ isOpen, onClose, currentPlan, newPlan, newBillingCycle, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fadeIn"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6 md:p-8 relative transform transition-all animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Confirm Plan Change</h3>
        <p className="text-gray-700 mb-6 text-center">
          You are currently subscribed to the{' '}
          <span className="font-semibold text-indigo-600">{currentPlan.title} ({currentPlan.type})</span> plan.
          <br /><br />
          You are about to change to the{' '}
          <span className="font-semibold text-purple-600">{newPlan.title} ({newBillingCycle})</span> plan.
          <br /><br />
          Your current subscription will be updated, and new charges may apply immediately or at the next billing cycle depending on your new plan.
        </p>

		<div className="flex flex-col sm:flex-row justify-center gap-4">
		  <button
			onClick={onClose}
			// Changed py-3 to py-2, px-6 to px-4, text-lg to text-base
			className="flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-colors duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
		  >
			Cancel
		  </button>
		  <button
			onClick={onConfirm}
			// Changed py-3 to py-2, px-6 to px-4, text-lg to text-base
			className="flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-colors duration-200 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
		  >
			Confirm Change
		  </button>
		</div>
      </div>
    </div>
  );
}

SubscriptionChangeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentPlan: PropTypes.object, // Can be null if no current plan
  newPlan: PropTypes.object.isRequired,
  newBillingCycle: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
};