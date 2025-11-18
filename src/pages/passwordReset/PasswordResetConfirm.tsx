import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";

type ResetStatus = "idle" | "loading" | "success" | "error";

const PasswordResetConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<ResetStatus>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage("Der Link ist ungültig oder abgelaufen.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Die Passwörter stimmen nicht überein.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await axiosPublic.post("/auth/reset-password", {
        token,
        password,
      });
      setStatus("success");
      setMessage(
        response.data?.message || "Dein Passwort wurde erfolgreich geändert."
      );
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const fallback =
        error.response?.data?.errors?.[0]?.message ||
        "Der Link ist ungültig oder abgelaufen.";
      setStatus("error");
      setMessage(fallback);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Neues Passwort</h1>
        <p className="mt-2 text-sm text-gray-500">
          Bitte wähle ein sicheres Passwort mit mindestens 8 Zeichen.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Neues Passwort
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Passwort bestätigen
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || !token}
            className="w-full rounded-xl bg-black text-white! px-4 py-3 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Wird gespeichert..." : "Passwort ändern"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              status === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
          >
            Zur Anmeldung
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;




