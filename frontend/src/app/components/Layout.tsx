import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { AIAssistant } from './AIAssistant';

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <AIAssistant />
    </div>
  );
}
