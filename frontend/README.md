# AI Market Pulse - Frontend

React + Next.js frontend for AI Market Pulse platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts & Chart.js
- **HTTP Client**: Axios
- **UI Components**: Headless UI
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Backend API running on `http://localhost:8000`

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Other Commands

```bash
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
npm run format        # Format code with Prettier
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (auth)/         # Auth pages (login, register)
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── forecasts/      # Forecast pages
│   │   ├── price-sensitivity/
│   │   ├── sentiment/
│   │   ├── copilot/
│   │   ├── alerts/
│   │   ├── insights/
│   │   ├── settings/
│   │   └── layout.tsx
│   │
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── charts/        # Chart components
│   │   ├── forms/         # Form components
│   │   └── layout/        # Layout components
│   │
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   └── styles/            # Global styles
│
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Features

- 🔐 Authentication (Login/Register)
- 📂 Data Upload & Management
- 📊 Market Intelligence Dashboard
- 📈 AI Price Forecasting
- 💰 Price Sensitivity Analysis
- 📰 Market Sentiment Intelligence
- 🤖 AI Market Copilot (Chat Interface)
- 🚨 Alerts & Risk Intelligence
- 📊 Insights & Performance Dashboard

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:8000/ws` |
| `NODE_ENV` | Environment | `development` |

## Development Guidelines

### Code Style

- Use TypeScript for all files
- Follow ESLint and Prettier rules
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

### Component Guidelines

- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into custom hooks
- Use proper TypeScript types

### State Management

- Use Zustand for global state
- Keep local state in components when possible
- Implement proper loading and error states

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### AWS Amplify

1. Connect GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Type check
npm run type-check

# Lint
npm run lint
```

## Support

For issues and questions, please refer to the main project documentation or create an issue on GitHub.

## License

MIT License - see LICENSE file for details.
