import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { useContext, useRef } from "react";
import { axiosPublic } from "../../utils/axiosConfig";
import { mainContext } from "../../context/MainProvider";
import type { IUser } from "../../interfaces/user/IUser";

interface LoginProps {
  setUser : (value: IUser) => void
}


export default function Login() {
  
  const {setUser} = useContext(mainContext) as LoginProps

  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  

  const loginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = emailRef.current?.value || "" 
    const password = passRef.current?.value || ""

      try {
      const resp = await axiosPublic.post("/login", { email, password }, {
                    headers: {
                    Accept: "application/json", "Content-Type": "application/json",
                            },
                    withCredentials: true,
      });
      setUser(resp.data.loggingUser)
  navigate("/matche")
    } catch (error) {
      console.error(error)
    }
  }


  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log(tokenResponse);
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
