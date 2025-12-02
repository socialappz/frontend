import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import SignUp from "./pages/signup/SignUp";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import Layout from "./layout/Layout";
import ProtectedRoute from "./protectedRoute/ProtectedRoute";
import { Suspense, lazy } from "react";
import LoadingSpinner from "./components/common/LoadingSpinner";

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const MatchList = lazy(() => import("./pages/matchList/MatchList"));
const CoordinationResults = lazy(
  () => import("./pages/coordinationResults/CoordinationResults")
);
const Profile = lazy(() => import("./pages/profile/Profile"));
const ChatHistory = lazy(() => import("./components/chatHistory/ChatHistory"));
const Chat = lazy(() => import("./components/chat/Chat"));
const MyProfile = lazy(() => import("./pages/myProfile/MyProfile"));
const VerifyEmail = lazy(() => import("./pages/verifyEmail/VerifyEmail"));
const PasswordResetRequest = lazy(
  () => import("./pages/passwordReset/PasswordResetRequest")
);
const PasswordResetConfirm = lazy(
  () => import("./pages/passwordReset/PasswordResetConfirm")
);

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="signin" element={<Login />} />
        <Route
          path="verify-email"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <VerifyEmail />
            </Suspense>
          }
        />
        <Route
          path="reset-password"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <PasswordResetRequest />
            </Suspense>
          }
        />
        <Route
          path="reset-password/confirm"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <PasswordResetConfirm />
            </Suspense>
          }
        />

        <Route
          path="myprofile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <MyProfile />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="matche"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <MatchList />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="coordination-results"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <CoordinationResults />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="matche/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <Profile />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="chat/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <Chat />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="chats"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <ChatHistory />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
