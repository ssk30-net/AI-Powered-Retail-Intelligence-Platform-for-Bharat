// This file is not used in Next.js App Router
// Next.js uses file-based routing with page.tsx files
// Keeping this file for compatibility but it's not imported anywhere

import { ThemeProvider } from './context/ThemeContext';
import { ReactNode } from 'react';

export default function App({ children }: { children?: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
