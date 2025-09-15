import React from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_c2F2aW5nLWtpd2ktMzMuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  console.warn('Missing Clerk Publishable Key. Authentication features will be disabled.');
}

interface ClerkProviderProps {
  children: React.ReactNode;
}

export const ClerkProvider: React.FC<ClerkProviderProps> = ({ children }) => {
  if (!PUBLISHABLE_KEY) {
    // Return children without Clerk if no key is provided
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </BaseClerkProvider>
  );
};