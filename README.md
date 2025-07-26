# Timeline Educational Card Game

A full-stack educational card game built with React, TypeScript, Node.js, Express, and Prisma.

## 🏗️ Project Structure

This is a monorepo with the following structure:

```
timeline_game/
├── frontend/          # React + TypeScript frontend
├── backend/           # Node.js + Express + Prisma backend
├── docs/             # Project documentation
└── package.json      # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager
- PostgreSQL 14+ (for backend)
- Redis 6+ (for backend caching)

### Installation

1. **Install all dependencies:**
   ```bash
   yarn install:all
   ```

2. **Set up environment variables:**
   ```bash
   # Backend environment
   cd backend
   cp env.example .env
   # Edit .env with your database and Redis credentials
   ```

3. **Set up database:**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

### Development

**Run both frontend and backend simultaneously:**
```bash
yarn dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

**Run individually:**
```bash
# Frontend only
yarn dev:frontend

# Backend only
yarn dev:backend
```

### Testing

**Run all tests:**
```bash
yarn test
```

**Run with coverage:**
```bash
yarn test:coverage
```

**Run individually:**
```bash
# Frontend tests
yarn test:frontend

# Backend tests
yarn test:backend
```

### Building

**Build both applications:**
```bash
yarn build
```

**Build individually:**
```bash
# Frontend build
yarn build:frontend

# Backend build
yarn build:backend
```

### Linting

**Lint all code:**
```bash
yarn lint
```

**Fix linting issues:**
```bash
yarn lint:fix
```

## 📁 Available Scripts

### Root Level Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start both frontend and backend in development mode |
| `yarn build` | Build both applications for production |
| `yarn test` | Run all tests |
| `yarn test:coverage` | Run all tests with coverage reports |
| `yarn lint` | Lint all code |
| `yarn lint:fix` | Fix linting issues |
| `yarn clean` | Clean all build artifacts and node_modules |
| `yarn start` | Start both applications in production mode |

### Individual Package Commands

| Command | Description |
|---------|-------------|
| `yarn dev:frontend` | Start frontend development server |
| `yarn dev:backend` | Start backend development server |
| `yarn build:frontend` | Build frontend for production |
| `yarn build:backend` | Build backend for production |
| `yarn test:frontend` | Run frontend tests |
| `yarn test:backend` | Run backend tests |

## 🔧 Development Workflow

1. **Start development servers:**
   ```bash
   yarn dev
   ```

2. **Make changes** to frontend (React/TypeScript) or backend (Node.js/Express)

3. **Run tests** to ensure everything works:
   ```bash
   yarn test
   ```

4. **Check linting:**
   ```bash
   yarn lint
   ```

5. **Build for production:**
   ```bash
   yarn build
   ```

## 🌐 API Endpoints

The backend provides the following API endpoints:

### Games
- `POST /api/games` - Create a new game
- `POST /api/games/join` - Join an existing game
- `GET /api/games/:roomCode` - Get game by room code

### Health Check
- `GET /health` - Server health status

## 🗄️ Database

The application uses PostgreSQL with Prisma ORM. The database schema includes:

- **Game**: Game sessions and state
- **Player**: Game participants
- **Card**: Historical event cards
- **TimelineCard**: Placed cards in timeline

## 🧪 Testing

- **Frontend**: Vitest + React Testing Library
- **Backend**: Jest + Supertest
- **Coverage**: Both packages generate coverage reports

## 📚 Documentation

See the `docs/` directory for detailed documentation:

- [Current Project Status](./docs/Current%20Project%20Status.md)
- [Behavioral Test Plan](./docs/Behavioral%20Test%20Plan%20-%20Coverage%20Gap%20Areas.md)
- [Sprint Plans](./docs/)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Use ESLint for code quality
4. Follow the established project structure
5. Update documentation as needed

## 📄 License

MIT
