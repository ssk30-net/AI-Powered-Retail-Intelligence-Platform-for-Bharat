import { Search, Bell, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search markets, reports, insights..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">John Doe</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
          </div>
        </button>
      </div>
    </header>
  );
}
