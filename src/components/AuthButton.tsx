import React from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { User, LogIn } from 'lucide-react';

interface AuthButtonProps {
  variant?: 'default' | 'outline';
  showSignUp?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  variant = 'default', 
  showSignUp = false 
}) => {
  const { isSignedIn, user } = useUser();

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">Welcome, {user?.firstName || 'User'}!</span>
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  const buttonClasses = variant === 'outline' 
    ? "px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors flex items-center space-x-2"
    : "px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2";

  return (
    <div className="flex items-center space-x-3">
      <SignInButton mode="modal">
        <button className={buttonClasses}>
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
      </SignInButton>
      {showSignUp && (
        <SignUpButton mode="modal">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Sign Up</span>
          </button>
        </SignUpButton>
      )}
    </div>
  );
};