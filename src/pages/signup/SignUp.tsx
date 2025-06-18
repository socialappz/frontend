import { Link, useNavigate } from "react-router-dom";

import { useRef, useState } from "react";
import { axiosPublic } from "../../utils/axiosConfig";

export default function SignUp() {
  const [emailError, setEmailError] = useState<string>("")
  const [usernameError, setUsernameError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const navigator = useNavigate()
  const emailRef = useRef<HTMLInputElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)

  const signUpHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailError("")
    setUsernameError("")
    setPasswordError("")

    const email = emailRef.current?.value || "" 
    const username = usernameRef.current?.value || ""
    const password = passRef.current?.value || ""

    try {
      const response = await axiosPublic.post("/signup", 
        { email, username, password },
        { withCredentials: true }
      )
      
      if (response.data.existingUser) {
        navigator("/matche")
      } else {
        navigator("/signin")
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
            setEmailError(firstError.message || "Diese E-Mail-Adresse wird bereits verwendet");
          } else if (firstError.path === 'username') {
            setUsernameError(firstError.message || "Dieser Benutzername ist bereits vergeben");
          } else if (firstError.path === 'password') {
            setPasswordError(firstError.message || "Passwort erfüllt nicht die Anforderungen");
          } else {
            setEmailError(firstError.message || "Ein Fehler ist aufgetreten");
          }
        }
      } else {
        setEmailError("Ein Fehler ist aufgetreten");
      }
    }
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-black">
            Sign Up to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-6" onSubmit={signUpHandler}>
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
              <label htmlFor="username" className="block text-sm/6 font-medium text-black">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="username"
                  ref={usernameRef}
                  required
                  autoComplete="username"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {usernameError && (
                  <p className="mt-2 text-sm text-red-600">
                    {usernameError}
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
                  <a href="#" className="font-semibold text-black hover:text-indigo-500">
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

          <p className="mt-10 text-center text-sm/6 text-black">
           are you already a Member?{' '}
            <Link className="text-black!" to="/signin">Sign In</Link>
          </p>
        </div>
      </div>
    </>
  )
}