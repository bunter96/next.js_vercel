// components/ConfirmationModal.js
import React from 'react';
import PropTypes from 'prop-types';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmButtonText, cancelButtonText }) {
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

        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{title}</h3>
        <p className="text-gray-700 mb-6 text-center">{message}</p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-colors duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-colors duration-200 bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
};

ConfirmationModal.defaultProps = {
  confirmButtonText: 'Confirm',
  cancelButtonText: 'Cancel',
};