import { useEffect, useState } from "react";

const COOKIE_KEY = "cookieConsent";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const consent = localStorage.getItem(COOKIE_KEY);
    if (consent !== "accepted") {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    document.cookie = `${COOKIE_KEY}=accepted; path=/; max-age=${
      3600 * 24 * 365
    }; SameSite=Lax`;
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900">Cookie Consent</h2>
        <p className="mt-3 text-sm text-gray-600">
          we use cookies to enhance your experience on our website. By
          continuing to browse or use our services, you agree to our use of
          cookies. Please review our Privacy Policy for more information.
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full rounded-xl bg-black text-white! px-5 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl sm:w-auto"
          >
            Accept Cookies
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          You can change your cookie preferences at any time in the settings.
        </p>
      </div>
    </div>
  );
};

export default CookieConsent;
