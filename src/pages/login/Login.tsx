import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { useContext, useRef, useState } from "react";
import { axiosPublic } from "../../utils/axiosConfig";
import { mainContext } from "../../context/MainProvider";
import type { IUser } from "../../interfaces/user/IUser";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface LoginProps {
  setUser : (value: IUser) => void
}

export default function Login() {
  const {setUser} = useContext(mainContext) as LoginProps
  const [emailError, setEmailError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const loginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailError("")
    setPasswordError("")
    setLoading(true)
    
    const email = emailRef.current?.value || "" 
    const password = passRef.current?.value || ""

    try {
      const resp = await axiosPublic.post("/login", { email, password }, {
        headers: {
          Accept: "application/json", "Content-Type": "application/json",
        },
        withCredentials: true,
      });      
      
      // Fallback: Token aus Response setzen, falls Backend-Cookies nicht funktionieren
      if (resp.data.token) {
        console.log('Setting token cookie manually');
        document.cookie = `token=${resp.data.token}; path=/; max-age=${3600 * 24}; secure; samesite=lax`;
      }
      
      setUser(resp.data.loggingUser)
      if (resp.data.isNewUser) {
        console.log("Redirecting to dashboard - new user");
        navigate("/dashboard")
      } else {
        console.log("Redirecting to matche - existing user");
        navigate("/matche")
      }
      
    } catch (error: any) {
      console.log("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        errors: error.response?.data?.errors
      });
      
      if (!error.response?.data) {
        setEmailError("Ein unerwarteter Fehler ist aufgetreten");
        return;
      }

      const errorData = error.response.data;
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const firstError = errorData.errors[0];
        if (firstError) {
          if (firstError.path === 'email') {
            setEmailError(firstError.message || "Benutzer nicht gefunden");
          } else if (firstError.path === 'password') {
            setPasswordError(firstError.message || "Passwort ist falsch");
          } else {
            setEmailError(firstError.message || "Ein Fehler ist aufgetreten");
          }
        }
      } else if (error.response?.status === 401) {
        if (errorData.error?.includes("Password")) {
          setPasswordError("Passwort ist falsch");
        } else {
          setEmailError("Benutzer nicht gefunden");
        }
      } else {
        setEmailError("Ein Fehler ist aufgetreten");
      }
    } finally {
      setLoading(false)
    }
  }

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      fetchUserInfo(tokenResponse.access_token);
    },
    flow: 'implicit',
  });

  const fetchUserInfo = async (accessToken: string) => {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Willkommen zurück</h1>
          <p className="text-gray-600">Melde dich in deinem Konto an</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <form onSubmit={loginHandler} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                ref={emailRef}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="deine@email.com"
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Passwort
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  Passwort vergessen?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                ref={passRef}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                "Anmelden"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">oder</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => login()}
                className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Mit Google anmelden
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Noch kein Konto?{' '}
            <Link 
              to="/signup" 
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
