import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { axiosPublic } from "../../utils/axiosConfig";
import { mainContext } from "../../context/MainProvider";

type AuthMode = "signin" | "signup";

interface AuthPageProps {
  initialMode?: AuthMode;
}

const AuthPage = ({ initialMode = "signin" }: AuthPageProps) => {
  const navigate = useNavigate();
  const { setUser, reloadUser } = useContext(mainContext);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [signupSuccessMessage, setSignupSuccessMessage] = useState("");
  const [verificationPrompt, setVerificationPrompt] = useState<{
    email: string;
    message: string;
  } | null>(null);
  const [resendInfo, setResendInfo] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [, setGoogleLoading] = useState(false);

  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign-up state
  const signupEmailRef = useRef<HTMLInputElement>(null);
  const signupUsernameRef = useRef<HTMLInputElement>(null);
  const signupPasswordRef = useRef<HTMLInputElement>(null);
  const [signupEmailError, setSignupEmailError] = useState("");
  const [signupUsernameError, setSignupUsernameError] = useState("");
  const [signupPasswordError, setSignupPasswordError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const clearLoginErrors = () => {
    setLoginEmailError("");
    setLoginPasswordError("");
  };

  const handleResendVerification = async () => {
    if (!verificationPrompt?.email) {
      return;
    }

    setResendLoading(true);
    setResendInfo(null);

    try {
      const response = await axiosPublic.post("/auth/resend-verification", {
        email: verificationPrompt.email,
      });
      setResendInfo({
        type: "success",
        message:
          response.data?.message ||
          "Verification has been sent to your email address.",
      });
    } catch (error: any) {
      const fallback =
        error.response?.data?.errors?.[0]?.message ||
        "Failed to send verification email.";
      setResendInfo({
        type: "error",
        message: fallback,
      });
    } finally {
      setResendLoading(false);
    }
  };

  const clearSignupErrors = () => {
    setSignupEmailError("");
    setSignupUsernameError("");
    setSignupPasswordError("");
  };

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    if (nextMode === "signin") {
      clearSignupErrors();
    } else {
      clearLoginErrors();
      setSignupSuccessMessage("");
    }
    setVerificationPrompt(null);
    setResendInfo(null);
    setGoogleError("");
    setResendLoading(false);
    setMode(nextMode);
    navigate(nextMode === "signin" ? "/signin" : "/signup", { replace: true });
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearLoginErrors();
    setLoginLoading(true);

    const email = loginEmailRef.current?.value || "";
    const password = loginPasswordRef.current?.value || "";

    try {
      const resp = await axiosPublic.post(
        "/auth/login",
        { email, password },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      if (resp.data.token) {
        document.cookie = `token=${resp.data.token}; path=/; max-age=${
          3600 * 24
        }; secure; samesite=lax`;
      }

      setUser(resp.data.loggingUser);
      if (reloadUser) await reloadUser();
      setVerificationPrompt(null);
      setResendInfo(null);
      setSignupSuccessMessage("");
      if (!resp.data.loggingUser?.profileCompleted) {
        navigate("/dashboard");
      } else {
        navigate("/matche");
      }
    } catch (error: any) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        errors: error.response?.data?.errors,
      });

      setVerificationPrompt(null);
      setResendInfo(null);

      if (!error.response?.data) {
        setLoginEmailError("Something went wrong.");
        return;
      }

      const errorData = error.response.data;
      const firstError =
        Array.isArray(errorData.errors) && errorData.errors.length > 0
          ? errorData.errors[0]
          : null;

      if (
        error.response?.status === 403 &&
        firstError?.code === "EMAIL_NOT_VERIFIED"
      ) {
        const message =
          firstError.message || "please verify your email to log in.";
        setLoginEmailError(message);
        setVerificationPrompt({
          email,
          message,
        });
        return;
      }
      if (firstError) {
        if (firstError.path === "email") {
          setLoginEmailError(firstError.message || "User not found.");
        } else if (firstError.path === "password") {
          setLoginPasswordError(firstError.message || "Incorrect password.");
        } else {
          setLoginEmailError(firstError.message || "Something went wrong.");
        }
      } else if (error.response?.status === 401) {
        if (errorData.error?.includes("Password")) {
          setLoginPasswordError("Incorrect password.");
        } else {
          setLoginEmailError("User nicht gefunden.");
        }
      } else {
        setLoginEmailError("Etwas ist schiefgelaufen.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearSignupErrors();
    setSignupLoading(true);

    const email = signupEmailRef.current?.value || "";
    const username = signupUsernameRef.current?.value || "";
    const password = signupPasswordRef.current?.value || "";

    try {
      const response = await axiosPublic.post(
        "/auth/signup",
        { email, username, password },
        { withCredentials: true },
      );

      const message =
        response.data?.message ||
        "Registration successful! Please verify your email before logging in.";
      setSignupSuccessMessage(message);
      setVerificationPrompt(null);
      setResendInfo(null);
      if (loginEmailRef.current) {
        loginEmailRef.current.value = email;
      }
      setSignupLoading(false);
      handleModeChange("signin");
      return;
    } catch (error: any) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        errors: error.response?.data?.errors,
      });

      if (!error.response?.data) {
        setSignupEmailError("Something went wrong.");
        return;
      }

      const errorData = error.response.data;

      if (errorData.errors && Array.isArray(errorData.errors)) {
        const firstError = errorData.errors[0];
        if (firstError) {
          if (firstError.path === "email") {
            setSignupEmailError(
              firstError.message || "The email is already in use.",
            );
          } else if (firstError.path === "username") {
            setSignupUsernameError(
              firstError.message || "Please choose a valid username.",
            );
          } else if (firstError.path === "password") {
            setSignupPasswordError(
              firstError.message || "please choose a stronger password.",
            );
          } else {
            setSignupEmailError(firstError.message || "Something went wrong.");
          }
        }
      } else {
        setSignupEmailError("Something went wrong.");
      }
    }

    setSignupLoading(false);
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setGoogleError("Google-Anmeldung fehlgeschlagen.");
      return;
    }
    setGoogleError("");
    setGoogleLoading(true);
    try {
      const resp = await axiosPublic.post(
        "/auth/google",
        { id_token: idToken },
        { withCredentials: true },
      );
      if (resp.data.token) {
        document.cookie = `token=${resp.data.token}; path=/; max-age=${
          3600 * 24
        }; secure; samesite=lax`;
      }
      setUser(resp.data.loggingUser);
      if (reloadUser) await reloadUser();
      setVerificationPrompt(null);
      setResendInfo(null);
      setSignupSuccessMessage("");
      if (!resp.data.loggingUser?.profileCompleted) {
        navigate("/dashboard");
      } else {
        navigate("/matche");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.errors?.[0]?.message ||
        "Google-Anmeldung fehlgeschlagen.";
      setGoogleError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-Inter">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div
          className="relative h-72 w-full overflow-hidden bg-cover bg-center lg:h-auto lg:flex-1"
          style={{ backgroundImage: "url(/login_bg.jpg)" }}
        >
          <div className="absolute inset-0 bg-[#006557]/60" />
          <div className="relative flex h-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Dinder" className="h-8 w-auto" />
            </div>

            <div className="max-w-xl">
              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Never Walk
                <br />
                <span className="text-[#F1D96B]">Alone</span> Again
              </h1>
              <p className="mt-4 max-w-md text-sm text-white/90 sm:text-base">
                Connect with dog owners near you and give your dog the social
                life they deserve.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-1 items-center justify-center px-4 py-10 lg:w-[480px] lg:flex-none lg:px-12">
          <div className="w-full max-w-md">
            <div>
              <h2 className="text-2xl font-bold text-[#35374B] sm:text-3xl">
                Welcome to Connect
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Log in or sign up to build your profile.
              </p>
            </div>

            <div className="mt-6 flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => handleModeChange("signin")}
                className={`w-1/2 rounded-full! px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === "signin"
                    ? "bg-[#00A991] text-white"
                    : "text-[#006557] hover:bg-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className={`w-1/2 rounded-full! px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === "signup"
                    ? "bg-[#00A991] text-white"
                    : "text-[#006557] hover:bg-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
              {mode === "signin" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  {signupSuccessMessage && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {signupSuccessMessage}
                    </div>
                  )}

                  {verificationPrompt && (
                    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      <p>{verificationPrompt.message}</p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendLoading}
                          className="w-full rounded-full border border-amber-400 px-4 py-2 font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {resendLoading
                            ? "Email has been sent..."
                            : "Resend Verification Email"}
                        </button>
                        {resendInfo && (
                          <span
                            className={`text-sm ${
                              resendInfo.type === "success"
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            {resendInfo.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="signin-email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      E-Mail
                    </label>
                    <input
                      id="signin-email"
                      name="email"
                      type="email"
                      ref={loginEmailRef}
                      required
                      autoComplete="email"
                      className="mt-2 w-full rounded-full border border-[#00A991]/60 bg-gray-100 px-5 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#00A991]/30"
                      placeholder="Luna@example.com"
                    />
                    {loginEmailError && (
                      <p className="mt-2 text-sm text-red-600">
                        {loginEmailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signin-password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <input
                      id="signin-password"
                      name="password"
                      type="password"
                      ref={loginPasswordRef}
                      required
                      autoComplete="current-password"
                      className="mt-2 w-full rounded-full border border-[#00A991]/60 bg-gray-100 px-5 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#00A991]/30"
                      placeholder="••••••••"
                    />
                    {loginPasswordError && (
                      <p className="mt-2 text-sm text-red-600">
                        {loginPasswordError}
                      </p>
                    )}
                  </div>

                  {loginLoading ? (
                    <button
                      disabled
                      type="button"
                      className="flex w-full items-center justify-center gap-3 rounded-full bg-[#00A991] px-6 py-3 text-sm font-semibold text-white opacity-70"
                    >
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="h-4 w-4 animate-spin text-white/70"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="#ffffff"
                        />
                      </svg>
                      Loading...
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full rounded-full bg-[#00A991] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008774] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Login
                    </button>
                  )}

                  <div className="pt-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-3 text-gray-400">
                          or continue with
                        </span>
                      </div>
                    </div>

                    <div className="mt-5">
                      {googleError && (
                        <p className="mb-2 text-sm text-red-600">
                          {googleError}
                        </p>
                      )}
                      <div className="flex justify-center [&>div]:!w-full [&>div]:!flex [&>div]:!justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => {
                            setGoogleError("Google-Anmeldung fehlgeschlagen.");
                            setGoogleLoading(false);
                          }}
                          type="standard"
                          size="large"
                          theme="outline"
                          text="continue_with"
                          locale="de"
                          width="320"
                          use_fedcm_for_button
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-4 w-full text-center text-sm font-medium text-[#006557] transition-colors hover:text-[#00A991]"
                      onClick={() => navigate("/reset-password")}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="signup-username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Username
                    </label>
                    <input
                      id="signup-username"
                      name="username"
                      type="text"
                      ref={signupUsernameRef}
                      required
                      autoComplete="username"
                      placeholder="Luna Thomson"
                      className="mt-2 w-full rounded-full border border-[#00A991]/60 bg-gray-100 px-5 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#00A991]/30"
                    />
                    {signupUsernameError && (
                      <p className="mt-2 text-sm text-red-600">
                        {signupUsernameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      E-Mail
                    </label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      ref={signupEmailRef}
                      required
                      autoComplete="email"
                      placeholder="Luna@example.com"
                      className="mt-2 w-full rounded-full border border-[#00A991]/60 bg-gray-100 px-5 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#00A991]/30"
                    />
                    {signupEmailError && (
                      <p className="mt-2 text-sm text-red-600">
                        {signupEmailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      ref={signupPasswordRef}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-full border border-[#00A991]/60 bg-gray-100 px-5 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#00A991]/30"
                    />
                    {signupPasswordError && (
                      <p className="mt-2 text-sm text-red-600">
                        {signupPasswordError}
                      </p>
                    )}
                  </div>

                  {signupLoading ? (
                    <button
                      disabled
                      type="button"
                      className="flex w-full items-center justify-center gap-3 rounded-full bg-[#00A991] px-6 py-3 text-sm font-semibold text-white opacity-70"
                    >
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="h-4 w-4 animate-spin text-white/70"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="#ffffff"
                        />
                      </svg>
                      Signing Up...
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="w-full rounded-full bg-[#00A991] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008774] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Create Account
                    </button>
                  )}

                  <div className="pt-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-3 text-gray-400">
                          or continue with
                        </span>
                      </div>
                    </div>

                    <div className="mt-5">
                      {googleError && (
                        <p className="mb-2 text-sm text-red-600">
                          {googleError}
                        </p>
                      )}
                      <div className="flex justify-center [&>div]:!w-full [&>div]:!flex [&>div]:!justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => {
                            setGoogleError("Google-Anmeldung fehlgeschlagen.");
                            setGoogleLoading(false);
                          }}
                          type="standard"
                          size="large"
                          theme="outline"
                          text="signup_with"
                          locale="de"
                          width="320"
                          use_fedcm_for_button
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#006557] transition-colors hover:text-[#00A991]"
            >
              <span aria-hidden="true">←</span>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
