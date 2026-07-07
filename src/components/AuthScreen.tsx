import React from 'react';
import AuthRouter from '../auth/AuthRouter';
import { UserState } from '../types';

interface AuthScreenProps {
  initialUser?: UserState | null;
  onAuthComplete: (authData: { 
    uid?: string; 
    email?: string; 
    displayName?: string; 
    isOffline: boolean; 
    username?: string;
    onboarded?: boolean;
    fullState?: any;
  }) => void;
}

export default function AuthScreen({ initialUser, onAuthComplete }: AuthScreenProps) {
  return <AuthRouter initialUser={initialUser} onAuthComplete={onAuthComplete} />;
}
