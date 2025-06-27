// protectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { mainContext } from '../context/MainProvider';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(mainContext);

  if (loading) {
    return  <>
  <LoadingSpinner size="small" text="Loading..." />
  </>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}