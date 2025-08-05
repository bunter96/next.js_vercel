import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");
    if (!consent) {
      // Delay for a smoother entrance
      const timer = setTimeout(() => setVisible(true), 500); 
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setVisible(false);
    Cookies.set("cookie_consent", "accepted", { expires: 365 });
  };

  const handleReject = () => {
    setVisible(false);
    Cookies.set("cookie_consent", "rejected", { expires: 365 });
  };

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transition-transform duration-500 ease-in-out transform ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      } z-50`}
    >
      <div className="flex items-center mb-4">
        <svg
          className="w-8 h-8 mr-3 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Cookie Consent
        </h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-5">
        We use essential cookies to ensure the proper functioning of our
        website. By clicking &quot;Accept,&quot; you agree to our use of these cookies.{" "}
        <Link
          href="/privacy-policy"
          className="font-semibold text-blue-500 hover:text-blue-400 underline"
        >
          Learn more in our Privacy Policy
        </Link>
        .
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={handleReject}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded-lg transition-colors"
        >
          Reject
        </button>
        <button
          onClick={handleAccept}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}