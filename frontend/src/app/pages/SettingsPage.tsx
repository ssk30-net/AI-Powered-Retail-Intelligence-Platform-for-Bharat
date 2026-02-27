import { Settings, User, Bell, Shield, Database, Mail, RefreshCw } from 'lucide-react';
import { resetUserState } from '../utils/userState';
import { useState } from 'react';

export function SettingsPage() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetOnboarding = () => {
    resetUserState();
    setShowResetConfirm(true);
    setTimeout(() => {
      setShowResetConfirm(false);
    }, 3000);
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-8 h-8 text-gray-900 dark:text-gray-100" />
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Menu */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-4">
          <nav className="space-y-1">
            {[
              { label: 'Profile', icon: User, active: true },
              { label: 'Notifications', icon: Bell, active: false },
              { label: 'Security', icon: Shield, active: false },
              { label: 'Data & Privacy', icon: Database, active: false },
              { label: 'Email Preferences', icon: Mail, active: false },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    item.active
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Profile Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg"></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg"></div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg"></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Preferences
            </h3>
            <div className="space-y-4">
              {['Email Notifications', 'Push Notifications', 'Weekly Digest', 'Market Alerts'].map(
                (pref, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {pref}
                    </span>
                    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button className="px-6 py-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Save Changes
            </button>
          </div>

          {/* Developer Tools */}
          <div className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Developer Tools
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
              Reset your onboarding state to test the first-time user experience
            </p>
            <button
              onClick={handleResetOnboarding}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Reset Onboarding State
            </button>
            {showResetConfirm && (
              <p className="mt-3 text-sm text-green-700 dark:text-green-300 font-medium">
                ✓ Onboarding state reset! Log in again to see the onboarding flow.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}