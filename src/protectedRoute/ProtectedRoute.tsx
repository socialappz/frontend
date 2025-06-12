// protectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { mainContext } from '../context/MainProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(mainContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}