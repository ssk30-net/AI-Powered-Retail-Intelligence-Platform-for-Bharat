# Contributing to AI Market Pulse

Thank you for your interest in contributing to AI Market Pulse! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ai-market-pulse.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- AWS CLI configured
- Docker (optional)

### Installation
```bash
npm install
pip install -r requirements.txt
cp .env.example .env
# Configure your .env file
```

### Running Locally
```bash
npm run dev  # Frontend
python -m uvicorn backend.main:app --reload  # Backend API
```

## Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Coding Standards

- Follow existing code style
- Use TypeScript for frontend
- Use type hints in Python
- Write meaningful commit messages
- Add comments for complex logic

## Testing

- Write unit tests for new features
- Maintain >80% code coverage
- Run `npm test` and `pytest` before submitting

## Questions?

Open an issue or reach out to the maintainers.
