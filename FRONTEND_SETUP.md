# Frontend Setup Guide - AI Market Pulse

## Quick Start

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

---

## Available Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
```

### Production Build
```bash
npm run build        # Build for production
npm start            # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/         # Main dashboard
│   │   ├── forecasts/         # Price forecasting
│   │   ├── price-sensitivity/ # Price simulator
│   │   ├── sentiment/         # Sentiment analysis
│   │   ├── copilot/          # AI Copilot chat
│   │   ├── alerts/           # Alerts & notifications
│   │   ├── insights/         # Insights dashboard
│   │   ├── settings/         # User settings
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── charts/           # Chart components
│   │   │   ├── LineChart.tsx
│   │   │   ├── AreaChart.tsx
│   │   │   └── PieChart.tsx
│   │   ├── forms/            # Form components
│   │   └── layout/           # Layout components
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   └── useForecast.ts
│   │
│   ├── lib/                  # Utility libraries
│   │   ├── api.ts           # Axios API client
│   │   └── utils.ts         # Helper functions
│   │
│   ├── store/               # Zustand state management
│   │   ├── authStore.ts
│   │   ├── dashboardStore.ts
│   │   └── forecastStore.ts
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   │
│   └── styles/              # Additional styles
│
├── public/                  # Static assets
│   ├── images/
│   └── icons/
│
├── .env.example            # Environment variables template
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore rules
├── .prettierrc            # Prettier configuration
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Frontend documentation
```

---

## Tech Stack Details

### Core Framework
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### State Management
- **Zustand**: Lightweight state management
- Stores for: auth, dashboard, forecasts, alerts, copilot

### Data Fetching
- **Axios**: HTTP client with interceptors
- JWT token management
- Automatic token refresh
- Error handling

### Charts & Visualization
- **Recharts**: React charting library
- **Chart.js**: Canvas-based charts
- Line, Area, Bar, Pie charts
- Interactive tooltips

### UI Components
- **Headless UI**: Unstyled accessible components
- **Lucide React**: Icon library
- **Framer Motion**: Animations
- **React Hot Toast**: Notifications

### Forms & Validation
- **React Hook Form**: Form management
- **Zod**: Schema validation

### File Upload
- **React Dropzone**: Drag-and-drop file upload

---

## Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Optional
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_MAPBOX_TOKEN=
NODE_ENV=development
```

---

## Development Workflow

### 1. Start Backend API First
Make sure your FastAPI backend is running on `http://localhost:8000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access Application
Open browser: http://localhost:3000

### 4. Hot Reload
Changes to files will automatically reload the page

---

## Building for Production

### 1. Build
```bash
npm run build
```

This creates an optimized production build in `.next/` directory.

### 2. Test Production Build Locally
```bash
npm start
```

### 3. Deploy
Deploy to:
- **Vercel** (recommended for Next.js)
- **AWS Amplify**
- **Netlify**
- **Custom server**

---

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy automatically

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Option 2: AWS Amplify

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
3. Add environment variables
4. Deploy

### Option 3: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t ai-market-pulse-frontend .
docker run -p 3000:3000 ai-market-pulse-frontend
```

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

### TypeScript Errors
```bash
# Check types
npm run type-check

# Fix auto-fixable issues
npm run lint -- --fix
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### API Connection Issues
1. Check backend is running: http://localhost:8000/docs
2. Verify `NEXT_PUBLIC_API_URL` in `.env`
3. Check browser console for CORS errors
4. Ensure backend allows frontend origin

---

## Code Style Guidelines

### TypeScript
- Use explicit types for function parameters and returns
- Avoid `any` type when possible
- Use interfaces for object shapes

### Components
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks

### Naming Conventions
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase (e.g., `User`, `ApiResponse`)

### File Organization
- One component per file
- Co-locate related files
- Use index files for cleaner imports

---

## Testing (Future)

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

---

## Performance Optimization

### Implemented
- Code splitting (automatic with Next.js)
- Image optimization (Next.js Image component)
- Font optimization (next/font)
- CSS optimization (Tailwind CSS purge)

### Recommended
- Lazy load heavy components
- Implement virtual scrolling for large lists
- Use React.memo for expensive renders
- Optimize images before upload

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Getting Help

### Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs

### Issues
- Check existing issues in project repository
- Create new issue with detailed description
- Include error messages and screenshots

---

## Next Steps

1. ✅ Setup complete
2. 🔨 Build authentication pages
3. 📊 Create dashboard components
4. 📈 Implement forecast visualization
5. 🤖 Integrate AI Copilot
6. 🚀 Deploy to production

---

## Quick Reference

### Start Development
```bash
cd frontend && npm run dev
```

### Access Application
```
http://localhost:3000
```

### API Endpoint
```
http://localhost:8000/api/v1
```

### Build for Production
```bash
npm run build && npm start
```

---

**Happy Coding! 🚀**
