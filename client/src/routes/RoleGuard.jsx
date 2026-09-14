import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AccessDenied } from './AccessDenied';

export const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return children;
};
