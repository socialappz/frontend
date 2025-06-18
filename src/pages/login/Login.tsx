import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { useContext, useRef, useState } from "react";
import { axiosPublic } from "../../utils/axiosConfig";
import { mainContext } from "../../context/MainProvider";
import type { IUser } from "../../interfaces/user/IUser";

interface LoginProps {
  setUser : (value: IUser) => void
}


export default function Login() {
  
  const {setUser} = useContext(mainContext) as LoginProps
  const [emailError, setEmailError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")

  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  

  const loginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailError("")
    setPasswordError("")
    
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
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-6" onSubmit={loginHandler}>
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-black">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  ref={emailRef}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-600">
                    {emailError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-black">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-black! hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  ref={passRef}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">
                    {passwordError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <Link className="text-black!" to="/signup">Sign Up</Link>
          </p>
          <span>or Continue with </span>
          <button className="text-white" onClick={()=>login()}>Google Sign Up</button>
        </div>
      </div>
    </>
  )
}
