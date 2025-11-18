import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";

type VerifyStatus = "loading" | "success" | "error";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState(
    "Please wait while we verify your email..."
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("The verification link is invalid.");
      return;
    }

    const verify = async () => {
      try {
        const response = await axiosPublic.post("/auth/verify-email", {
          token,
        });
        setStatus("success");
        setMessage(
          response.data?.message || "E-Mail was successfully verified"
        );
      } catch (error: any) {
        const fallback =
          error.response?.data?.errors?.[0]?.message ||
          "Der Verifizierungslink ist ungültig oder abgelaufen.";
        setStatus("error");
        setMessage(fallback);
      }
    };

    verify();
  }, [searchParams]);

  const getStatusStyles = () => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50 text-green-700";
      case "error":
        return "border-red-200 bg-red-50 text-red-600";
      default:
        return "border-blue-200 bg-blue-50 text-blue-700";
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <div
          className={`rounded-2xl border px-6 py-5 text-center text-base font-medium ${getStatusStyles()}`}
        >
          {message}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          {status === "loading" ? (
            <span className="text-sm text-gray-500">
              Verifying your email, please wait...
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="w-full rounded-xl bg-black text-white! px-4 py-3 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
              >
                Go to Homepage
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;



