# Timeline Game Frontend

This is the frontend application for the Timeline Educational Card Game, built with React 18, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Yarn package manager

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Start the development server:
```bash
yarn dev
```

3. Open your browser and navigate to `http://localhost:3000`

## 🛠 Development

### Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run tests
- `yarn test:ui` - Run tests with UI
- `yarn test:coverage` - Run tests with coverage report
- `yarn lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Basic components (Button, Input, etc.)
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── test/               # Test setup and utilities
```

### Key Features

- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Hook Form**: Form handling with validation
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Vitest**: Fast unit testing framework

## 🎨 Design System

The application uses a consistent design system with:

- **Colors**: Primary (blue), Secondary (gray), Success (green), Danger (red)
- **Typography**: Inter font family
- **Components**: Reusable components with consistent styling
- **Responsive**: Mobile-first responsive design

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### API Integration

The frontend is configured to communicate with the backend API. Make sure the backend server is running on the configured port.

## 🧪 Testing

The project uses Vitest and React Testing Library for testing:

```bash
# Run all tests
yarn test

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage
```

## 📦 Build

To build the application for production:

```bash
yarn build
```

The built files will be in the `dist/` directory.

## 🚀 Deployment

The application can be deployed to any static hosting service (Netlify, Vercel, etc.) by building the project and serving the `dist/` directory.

## 📚 API Documentation

The frontend integrates with the following API endpoints:

- `POST /api/games` - Create a new game
- `POST /api/games/join` - Join an existing game
- `GET /api/games/:id` - Get game details
- `GET /api/games/room/:roomCode` - Get game by room code

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Ensure all tests pass before submitting changes
4. Use conventional commit messages

## 📄 License

This project is part of the Timeline Educational Card Game.
