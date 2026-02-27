import { Sidebar } from './Sidebar';
import { AIAssistant } from './AIAssistant';
import { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <AIAssistant />
    </div>
  );
}
