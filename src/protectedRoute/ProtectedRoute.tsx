// protectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { mainContext } from '../context/MainProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(mainContext);

  if (loading) {
    return  <div
    className="mt-5 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
    role="status">
  </div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}