import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";

type RequestStatus = "idle" | "loading" | "success" | "error";

const PasswordResetRequest = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await axiosPublic.post("/auth/request-password-reset", {
        email,
      });
      setStatus("success");
      setMessage(
        response.data?.message ||
          "if you have an account, a password reset link has been sent to your email."
      );
    } catch (error: any) {
      const fallback =
        error.response?.data?.errors?.[0]?.message ||
        "Something went wrong. Please try again later.";
      setStatus("error");
      setMessage(fallback);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email address below and we'll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="reset-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              E-Mail-Adresse
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="deine@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-black text-white! px-4 py-3 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              status === "error"
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-50"
          >
            new here? Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetRequest;

