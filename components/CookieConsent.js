import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set("cookie_consent", "accepted", { expires: 365 });
    setVisible(false);
  };

  const handleReject = () => {
    Cookies.set("cookie_consent", "rejected", { expires: 365 });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white px-4 py-3 flex flex-col sm:flex-row justify-between items-center z-50 text-sm">
      <p className="mb-2 sm:mb-0">
        We use essential cookies for secure login and app functionality.{" "}
        <Link href="/privacy-policy" className="underline text-blue-400 hover:text-blue-300">
          Learn more in our Privacy Policy
        </Link>.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
