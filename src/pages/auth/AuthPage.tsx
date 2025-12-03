import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
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

  const loginObj = useRef<any>(null);

  loginObj.current = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetchUserInfo(tokenResponse.access_token);
    },
    flow: "implicit",
  });

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
        }
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
    event: React.FormEvent<HTMLFormElement>
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
        { withCredentials: true }
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
              firstError.message || "The email is already in use."
            );
          } else if (firstError.path === "username") {
            setSignupUsernameError(
              firstError.message || "Please choose a valid username."
            );
          } else if (firstError.path === "password") {
            setSignupPasswordError(
              firstError.message || "please choose a stronger password."
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

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetchUserInfo(tokenResponse.access_token);
    },
    flow: "implicit",
  });

  const fetchUserInfo = async (accessToken: string) => {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    await res.json();
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === "signin" ? "Login" : "Create an Account"}
          </h2>
          <p className="text-sm text-gray-500">
            Change between login and sign up modes
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleModeChange("signin")}
            className={`w-1/2 py-2 rounded-lg font-semibold transition-all hover:border-white ${
              mode === "signin"
                ? "bg-white shadow text-black!"
                : "text-white hover:bg-black! hover:text-white!"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("signup")}
            className={`w-1/2 py-2 rounded-lg font-semibold transition-all ${
              mode === "signup"
                ? "bg-white shadow text-black!"
                : "text-white hover:text-white! hover:bg-black!"
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          {mode === "signin" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
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
                      className="w-full rounded-lg border border-amber-400 px-4 py-2 font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="your@email.com"
                />
                {loginEmailError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {loginEmailError}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="signin-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm text-white! hover:text-black! hover:bg-white! hover:border-black! font-medium"
                    onClick={() => navigate("/reset-password")}
                  >
                    Forgot your password?
                  </button>
                </div>
                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  ref={loginPasswordRef}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                {loginPasswordError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {loginPasswordError}
                  </p>
                )}
              </div>

              {loginLoading ? (
                <button
                  disabled
                  type="button"
                  className="w-full bg-back text-white! py-2.5 px-5 text-sm font-medium bg-white! rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-black! dark:text-white! dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center justify-center"
                >
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-4 h-4 mr-3 text-gray-200 animate-spin dark:text-gray-600"
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
                      fill="#1C64F2"
                    />
                  </svg>
                  Loading...
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-back text-white! font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Login
                </button>
              )}

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ODER</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => login()}
                    className="w-full bg-white border border-gray-300 text-white! font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {signupEmailError && (
                  <p className="mt-2 text-sm text-red-600">
                    {signupEmailError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="signup-username"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  placeholder="your username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {signupUsernameError && (
                  <p className="mt-2 text-sm text-red-600">
                    {signupUsernameError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full bg-back text-white! py-2.5 px-5 text-sm font-medium bg-white! rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-black! dark:text-white! dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center justify-center"
                >
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-4 h-4 mr-3 text-gray-200 animate-spin dark:text-gray-600"
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
                      fill="#1C64F2"
                    />
                  </svg>
                  Signing Up...
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full bg-back text-white! font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Sign Up
                </button>
              )}

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("signin")}
                  className="font-semibold text-white! hover:text-black! hover:bg-white! transition-colors mt-4 hover:shadow-lg px-2 py-2 rounded-lg hover:shadow-gray-500! "
                >
                  Log In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
