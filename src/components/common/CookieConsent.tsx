import { useEffect, useState } from "react";

const COOKIE_KEY = "cookieConsent";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    document.cookie = `${COOKIE_KEY}=accepted; path=/; max-age=${
      3600 * 24 * 365
    }; SameSite=Lax; Secure`;
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem(COOKIE_KEY, "rejected");
    document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax; Secure`;
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900">Cookie Consent</h2>
        <p className="mt-3 text-sm text-gray-600">
          it's only simple cookies that we use to enhance your experience and
          analyze site traffic.
        </p>

        <div className="mt-6 flex justify-between gap-4 sm:justify-end">
          <button
            type="button"
            onClick={rejectCookies}
            className="w-full rounded-xl bg-black text-white! px-5 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl sm:w-auto"
          >
            Reject All Cookies
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="w-full rounded-xl bg-black text-white! px-5 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl sm:w-auto"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
