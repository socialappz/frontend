import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { axiosPublic } from "../../utils/axiosConfig";

export default function SignUp() {
  const [emailError, setEmailError] = useState<string>("")
  const [usernameError, setUsernameError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const navigator = useNavigate()
  const emailRef = useRef<HTMLInputElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)

  const signUpHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailError("")
    setUsernameError("")
    setPasswordError("")
   setLoading(true)
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
            setEmailError(firstError.message || "This Email already exist");
          } else if (firstError.path === 'username') {
            setUsernameError(firstError.message || "This Username already exist");
          } else if (firstError.path === 'password') {
            setPasswordError(firstError.message || "Passwort must be correct");
          } else {
            setEmailError(firstError.message || "Something is wrong");
          }
        }
      } else {
        setEmailError("Something is wrong");
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
                  <a href="#" className="font-semibold text-black! hover:text-indigo-500!">
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
               {loading ? (
               <>
            
<button disabled type="button" className="w-full bg-back text-white! py-2.5 px-5 me-2 text-sm font-medium bg-white! rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-black! dark:text-white! dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center justify-center">
<svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
</svg>
Loading...
</button>

               </>
              ) : (
              <button
              type="submit"
              disabled={loading}
              className="w-full bg-back text-white! font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >Sign Up</button>
              )}
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