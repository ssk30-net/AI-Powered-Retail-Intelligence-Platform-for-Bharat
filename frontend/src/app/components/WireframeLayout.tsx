import { WireframeSidebar } from './WireframeSidebar';
import { Navbar } from './Navbar';
import { ReactNode } from 'react';

export function WireframeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <WireframeSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
