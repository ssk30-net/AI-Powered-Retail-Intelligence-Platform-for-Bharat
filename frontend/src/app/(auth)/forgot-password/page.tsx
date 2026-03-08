'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
          <p className="text-gray-600 mt-2">
            Contact your administrator to reset your password, or sign in with your existing credentials.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Mail className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
