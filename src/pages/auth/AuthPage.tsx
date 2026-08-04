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

  // UI State für das Passwort-Auge (ändert nichts an der Logik)
  const [showPassword, setShowPassword] = useState(false);

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
    setShowPassword(false);
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
    <div className="min-h-screen w-full bg-white font-['Jost',sans-serif]!">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Side (Image & Hero Text) */}
        <div
          className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-24 bg-cover bg-center"
          style={{ backgroundImage: "url(/login_bg.jpg)" }}
        >
          {/* Teal Overlay passend zum Design */}
          <div className="absolute inset-0 bg-[#005c4f]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#003830]/30" />

          <div className="relative z-10 w-full max-w-lg">
            <h1 className="text-5xl xl:text-[64px] font-extrabold leading-[1.05] tracking-tight text-white mb-6">
              Never Walk
              <br />
              <span className="text-[#F1D96B]">Alone</span> Again
            </h1>
            <p className="max-w-md text-[17px] leading-relaxed text-white/90">
              Connect with dog owners near you and give your dog the social life
              they deserve.
            </p>
            <img src="/logo.png" alt="Dinder" className="mb-14 h-9 w-auto" />
          </div>
        </div>

        {/* Right Side (Auth Form) */}
        <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-10 sm:px-12 relative">
          <div className="w-full max-w-[420px]">
            {/* Header */}
            <div>
              <h2 className="text-[32px] font-extrabold text-[#35374B] tracking-tight">
                Welcome to Connect
              </h2>
              <p className="mt-1.5 text-[15px] text-gray-500">
                Log in or sign up to build your profile.
              </p>
            </div>

            {/* Toggle Login / Signup */}
            <div className="mt-8 flex rounded-full! bg-[#F3F4F6] p-1.5">
              <button
                type="button"
                onClick={() => handleModeChange("signin")}
                className={`w-1/2 rounded-full! py-2.5 text-sm font-semibold transition-colors ${
                  mode === "signin"
                    ? "bg-[#00A991] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className={`w-1/2 rounded-full! py-2.5 text-sm font-semibold transition-colors ${
                  mode === "signup"
                    ? "bg-[#00A991] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Area (No Card Wrapper) */}
            <div className="mt-8">
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
                          className="w-full rounded-full! border border-amber-400 px-4 py-2 font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
                      className="block text-sm text-gray-700 mb-1.5 ml-1"
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
                      className="w-full rounded-full! border border-[#4B5563] bg-[#EAECEF] px-5 py-3.5 text-[15px] text-[#35374B] placeholder:text-gray-400 outline-none transition focus:border-[#00A991] focus:ring-1 focus:ring-[#00A991]"
                      placeholder="Luna@example.com"
                    />
                    {loginEmailError && (
                      <p className="mt-2 text-sm text-red-600 ml-1">
                        {loginEmailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signin-password"
                      className="block text-sm text-gray-700 mb-1.5 ml-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        ref={loginPasswordRef}
                        required
                        autoComplete="current-password"
                        className="w-full rounded-full! border border-[#4B5563] bg-[#EAECEF] px-5 py-3.5 text-[15px] text-[#35374B] placeholder:text-gray-400 outline-none transition focus:border-[#00A991] focus:ring-1 focus:ring-[#00A991] pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#35374B] hover:text-[#00A991] transition-colors"
                      >
                        {showPassword ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                    {loginPasswordError && (
                      <p className="mt-2 text-sm text-red-600 ml-1">
                        {loginPasswordError}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    {loginLoading ? (
                      <button
                        disabled
                        type="button"
                        className="flex w-full items-center justify-center gap-3 rounded-full! bg-[#00A991] px-6 py-3.5 text-[15px] font-semibold text-white opacity-70"
                      >
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5 animate-spin text-white/70"
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
                        className="w-full rounded-full! bg-[#00A991] px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#008774] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Login
                      </button>
                    )}
                  </div>

                  <div className="pt-2">
                    {/* Divider passend zum Bild */}
                    <div className="relative my-7 flex items-center justify-center">
                      <div className="h-px w-full bg-[#E8D574]" />
                      <span className="bg-white px-4 text-xs font-medium text-[#c4b150] whitespace-nowrap">
                        or continue with
                      </span>
                      <div className="h-px w-full bg-[#E8D574]" />
                    </div>

                    <div>
                      {googleError && (
                        <p className="mb-2 text-sm text-red-600 text-center">
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
                          shape="pill"
                          text="continue_with"
                          locale="de"
                          width="320"
                          use_fedcm_for_button
                        />
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <button
                        type="button"
                        className="text-sm font-medium text-[#006557] transition-colors hover:text-[#00A991]"
                        onClick={() => navigate("/reset-password")}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="signup-username"
                      className="block text-sm text-gray-700 mb-1.5 ml-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="signup-username"
                      name="username"
                      type="text"
                      ref={signupUsernameRef}
                      required
                      autoComplete="username"
                      placeholder="Luna Thomson"
                      className="w-full rounded-full! border border-[#4B5563] bg-[#EAECEF] px-5 py-3.5 text-[15px] text-[#35374B] placeholder:text-gray-400 outline-none transition focus:border-[#00A991] focus:ring-1 focus:ring-[#00A991]"
                    />
                    {signupUsernameError && (
                      <p className="mt-2 text-sm text-red-600 ml-1">
                        {signupUsernameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-sm text-gray-700 mb-1.5 ml-1"
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
                      className="w-full rounded-full! border border-[#4B5563] bg-[#EAECEF] px-5 py-3.5 text-[15px] text-[#35374B] placeholder:text-gray-400 outline-none transition focus:border-[#00A991] focus:ring-1 focus:ring-[#00A991]"
                    />
                    {signupEmailError && (
                      <p className="mt-2 text-sm text-red-600 ml-1">
                        {signupEmailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-sm text-gray-700 mb-1.5 ml-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        ref={signupPasswordRef}
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="w-full rounded-full! border border-[#4B5563] bg-[#EAECEF] px-5 py-3.5 text-[15px] text-[#35374B] placeholder:text-gray-400 outline-none transition focus:border-[#00A991] focus:ring-1 focus:ring-[#00A991] pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#35374B] hover:text-[#00A991] transition-colors"
                      >
                        {showPassword ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                    {signupPasswordError && (
                      <p className="mt-2 text-sm text-red-600 ml-1">
                        {signupPasswordError}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    {signupLoading ? (
                      <button
                        disabled
                        type="button"
                        className="flex w-full items-center justify-center gap-3 rounded-full! bg-[#00A991] px-6 py-3.5 text-[15px] font-semibold text-white opacity-70"
                      >
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5 animate-spin text-white/70"
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
                        className="w-full rounded-full! bg-[#00A991] px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#008774] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Create Account
                      </button>
                    )}
                  </div>

                  <div className="pt-2">
                    {/* Divider passend zum Bild */}
                    <div className="relative my-7 flex items-center justify-center">
                      <div className="h-px w-full bg-[#E8D574]" />
                      <span className="bg-white px-4 text-xs font-medium text-[#c4b150] whitespace-nowrap">
                        or continue with
                      </span>
                      <div className="h-px w-full bg-[#E8D574]" />
                    </div>

                    <div>
                      {googleError && (
                        <p className="mb-2 text-sm text-red-600 text-center">
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
                          shape="pill"
                          text="continue_with"
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

            {/* Back to home - Ganz linksbündig wie im Bild */}
            <div className="mt-14 flex">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-[15px] font-medium text-[#006557] transition-colors hover:text-[#00A991]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
