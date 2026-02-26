import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Activity, Mail, Lock, Chrome, Cloud, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { isFirstTimeUser } from '../utils/userState';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if first-time user and redirect accordingly
    if (isFirstTimeUser()) {
      navigate('/onboarding');
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
      {/* Theme Toggle - Fixed Position */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 w-12 h-12 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        {theme === 'light' ? (
          <Moon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Sun className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white dark:text-gray-900" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Market Pulse</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Market Intelligence Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                  required
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Chrome className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Cloud className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AWS</span>
            </button>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Enterprise-grade security • SOC 2 Certified</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
          Don't have an account?{' '}
          <button className="text-gray-700 dark:text-gray-300 font-medium hover:underline">
            Contact Sales
          </button>
        </p>
      </div>
    </div>
  );
}