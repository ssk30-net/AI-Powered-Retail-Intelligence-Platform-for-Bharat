// This file is not used in Next.js App Router
// Next.js uses file-based routing with the following structure:
// - frontend/src/app/page.tsx -> /
// - frontend/src/app/login/page.tsx -> /login
// - frontend/src/app/app/page.tsx -> /app
// - frontend/src/app/app/forecast/page.tsx -> /app/forecast
// etc.

// Keeping this file for reference but it's not imported anywhere
export const routes = {
  home: '/',
  login: '/login',
  onboarding: '/onboarding',
  upload: '/upload',
  app: {
    dashboard: '/app',
    forecast: '/app/forecast',
    sentiment: '/app/sentiment',
    copilot: '/app/copilot',
    alerts: '/app/alerts',
    reports: '/app/reports',
    insights: '/app/insights',
    settings: '/app/settings',
  },
};