# AI Market Pulse - Project Structure

## Directory Layout

```
ai-market-pulse/
├── .github/                    # GitHub workflows and templates
│   └── workflows/
│       ├── ci.yml             # Continuous Integration
│       ├── deploy.yml         # Deployment pipeline
│       └── tests.yml          # Automated testing
│
├── infrastructure/             # Infrastructure as Code
│   ├── cdk/                   # AWS CDK stacks
│   │   ├── lib/
│   │   │   ├── api-stack.ts
│   │   │   ├── data-stack.ts
│   │   │   ├── ml-stack.ts
│   │   │   └── frontend-stack.ts
│   │   ├── bin/
│   │   │   └── app.ts
│   │   └── cdk.json
│   └── terraform/             # Alternative Terraform configs
│
├── backend/                    # Backend services
│   ├── api/                   # API Lambda functions
│   │   ├── handlers/
│   │   │   ├── prices.py
│   │   │   ├── forecasts.py
│   │   │   ├── sentiment.py
│   │   │   └── auth.py
│   │   ├── middleware/
│   │   ├── models/
│   │   └── utils/
│   │
│   ├── data-pipeline/         # ETL and data processing
│   │   ├── scrapers/
│   │   │   ├── ecommerce.py
│   │   │   ├── news.py
│   │   │   └── social.py
│   │   ├── processors/
│   │   └── loaders/
│   │
│   ├── ml-models/             # ML training and inference
│   │   ├── forecasting/
│   │   │   ├── train.py
│   │   │   ├── inference.py
│   │   │   └── models/
│   │   ├── sentiment/
│   │   └── features/
│   │
│   ├── database/              # Database schemas and migrations
│   │   ├── migrations/
│   │   ├── models.py
│   │   └── seeds/
│   │
│   └── shared/                # Shared utilities
│       ├── config.py
│       ├── logger.py
│       └── aws_clients.py
│
├── frontend/                   # Next.js frontend application
│   ├── src/
│   │   ├── app/               # Next.js 14 app directory
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/
│   │   │   ├── prices/
│   │   │   ├── forecasts/
│   │   │   ├── insights/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── charts/       # Chart components
│   │   │   ├── forms/        # Form components
│   │   │   └── layout/       # Layout components
│   │   │
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePrices.ts
│   │   │   └── useForecasts.ts
│   │   │
│   │   ├── lib/              # Utility libraries
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── types/            # TypeScript type definitions
│   │   │   ├── api.ts
│   │   │   ├── models.ts
│   │   │   └── index.ts
│   │   │
│   │   └── styles/           # Global styles
│   │       └── globals.css
│   │
│   ├── public/               # Static assets
│   │   ├── images/
│   │   └── icons/
│   │
│   └── tests/                # Frontend tests
│       ├── unit/
│       └── integration/
│
├── mobile/                    # React Native mobile app (Phase 7)
│   ├── src/
│   ├── android/
│   └── ios/
│
├── docs/                      # Documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # Architecture diagrams
│   ├── guides/              # User guides
│   └── development/         # Development guides
│
├── tests/                     # Backend tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                   # Utility scripts
│   ├── setup.sh
│   ├── deploy.sh
│   └── seed-data.py
│
├── .github/                   # GitHub configuration
├── .vscode/                   # VS Code settings
├── DESIGN.md                  # System design document
├── PHASES.md                  # Phase-wise implementation plan
├── README.md                  # Project overview
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE                    # MIT License
├── CHANGELOG.md              # Version history
├── package.json              # Node.js dependencies
├── requirements.txt          # Python dependencies
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest configuration
├── pytest.ini                # Pytest configuration
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── .prettierrc               # Prettier configuration
├── .eslintrc.json            # ESLint configuration
├── docker-compose.yml        # Local development services
└── Makefile                  # Development commands
```

## Key Directories Explained

### `/infrastructure`
Contains all Infrastructure as Code (IaC) definitions using AWS CDK or Terraform. This includes:
- VPC and networking
- Lambda functions
- DynamoDB tables
- S3 buckets
- SageMaker resources
- API Gateway configurations

### `/backend`
Python-based backend services including:
- **api/**: Lambda functions for REST API endpoints
- **data-pipeline/**: ETL jobs for data collection and processing
- **ml-models/**: Machine learning model training and inference
- **database/**: Database schemas, migrations, and ORM models

### `/frontend`
Next.js 14 application with:
- **app/**: App router pages and layouts
- **components/**: Reusable React components
- **hooks/**: Custom React hooks for state management
- **lib/**: Utility functions and API clients
- **types/**: TypeScript type definitions

### `/tests`
Comprehensive test suites:
- **unit/**: Unit tests for individual functions
- **integration/**: Integration tests for API endpoints
- **e2e/**: End-to-end tests for user workflows

### `/docs`
Project documentation:
- API specifications (OpenAPI/Swagger)
- Architecture diagrams
- User guides and tutorials
- Development setup instructions

## File Naming Conventions

### Python Files
- `snake_case.py` for modules
- `PascalCase` for classes
- `snake_case` for functions and variables

### TypeScript/JavaScript Files
- `kebab-case.tsx` for components
- `camelCase.ts` for utilities
- `PascalCase` for React components

### Test Files
- `test_*.py` for Python tests
- `*.test.ts` or `*.spec.ts` for TypeScript tests

## Module Organization

### Backend Modules
```python
backend/
├── api/
│   └── handlers/
│       └── prices.py          # GET /api/v1/prices
├── data_pipeline/
│   └── scrapers/
│       └── ecommerce.py       # E-commerce scraping logic
└── ml_models/
    └── forecasting/
        └── train.py           # Model training scripts
```

### Frontend Modules
```typescript
frontend/src/
├── app/
│   └── dashboard/
│       └── page.tsx           # Dashboard page
├── components/
│   └── charts/
│       └── PriceChart.tsx     # Price chart component
└── hooks/
    └── usePrices.ts           # Price data hook
```

## Configuration Files

- `.env.example`: Template for environment variables
- `tsconfig.json`: TypeScript compiler options
- `jest.config.js`: Jest testing configuration
- `pytest.ini`: Pytest configuration
- `.prettierrc`: Code formatting rules
- `.eslintrc.json`: Linting rules
- `docker-compose.yml`: Local development services

## Build Artifacts (Ignored)

These directories are generated during build and ignored by git:
- `node_modules/`: Node.js dependencies
- `.next/`: Next.js build output
- `dist/`: Distribution builds
- `__pycache__/`: Python bytecode
- `cdk.out/`: CDK synthesized templates
- `coverage/`: Test coverage reports

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Install dependencies: `make install`
4. Start local services: `docker-compose up -d`
5. Run development server: `make dev`

For detailed setup instructions, see the README.md file.
