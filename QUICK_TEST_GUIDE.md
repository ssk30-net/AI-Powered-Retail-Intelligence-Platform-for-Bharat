# Quick Test Guide - Sidebar Fix

## Test the Sidebar Integration

### 1. Start the Frontend
```bash
cd frontend
npm run dev
```

The frontend should start at `http://localhost:3000`

### 2. Login
1. Navigate to `http://localhost:3000/login`
2. Use test credentials:
   - Email: `test@example.com`
   - Password: `Test123`
3. Click "Login"

### 3. Verify Sidebar
After login, you should see:
- ✅ Sidebar on the left side
- ✅ Logo "AI Market Pulse" at the top
- ✅ 6 menu items with icons
- ✅ Logout button at the bottom
- ✅ Version "v1.1.0" displayed

### 4. Test Navigation
Click each menu item and verify:
- ✅ Dashboard - Shows KPI cards and "Coming Soon" message
- ✅ Forecasts - Shows commodity price forecasts
- ✅ Sentiment - Shows market sentiment analysis
- ✅ Insights - Shows AI-powered recommendations
- ✅ Alerts - Shows notifications and alerts
- ✅ AI Copilot - Shows chat interface

### 5. Test Active State
- ✅ Current page should be highlighted in blue
- ✅ Other menu items should be gray
- ✅ Hover effect should work on all items

### 6. Test Logout
- Click "Logout" button at bottom of sidebar
- ✅ Should redirect to login page
- ✅ Should clear authentication token

## Troubleshooting

### Sidebar Not Showing?
1. Check if you're on an authenticated route (`/dashboard`, `/forecasts`, etc.)
2. Check browser console for errors
3. Verify you're logged in (check localStorage for token)
4. Try hard refresh (Ctrl+Shift+R)

### Navigation Not Working?
1. Check browser console for routing errors
2. Verify all page files exist in `(dashboard)` folder
3. Check if Next.js dev server is running without errors

### Logout Not Working?
1. Check if authStore is properly imported
2. Verify logout function exists in store
3. Check browser console for errors

## Expected URLs

After login, these URLs should work:
- `http://localhost:3000/dashboard`
- `http://localhost:3000/forecasts`
- `http://localhost:3000/sentiment`
- `http://localhost:3000/insights`
- `http://localhost:3000/alerts`
- `http://localhost:3000/copilot`

All should show the sidebar!

## Success Criteria

✅ Sidebar visible on all authenticated pages
✅ All 6 menu items clickable and working
✅ Active page highlighted correctly
✅ Logout button works
✅ Smooth navigation between pages
✅ No console errors
✅ Responsive layout (sidebar + content)

## If Everything Works

You're ready to commit! See `FRONTEND_SIDEBAR_FIX.md` for commit instructions.
