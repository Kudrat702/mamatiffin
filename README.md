# 🍽️ Tiffin Service - Fullstack TypeScript Monorepo

A modern, fullstack tiffin (meal delivery) service application built with React, Express.js, MongoDB, and TypeScript in a monorepo structure.

## 🚀 Tech Stack

### Frontend (Client)
- **React 18.3+** with TypeScript
- **Vite 5.4+** for blazing fast development
- **Tailwind CSS 4.1+** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend (Server)
- **Node.js 18+** with TypeScript
- **Express.js 4.21+** web framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Helmet** for security
- **Morgan** for logging
- **Jest** for testing

## 📁 Project Structure

```
tiffin-service-monorepo/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript types
│   │   └── assets/           # Static assets
│   ├── public/               # Public assets
│   ├── package.json          # Client dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.ts    # Tailwind configuration
│   ├── tsconfig.json         # TypeScript config
│   └── .env.example          # Environment variables template
├── server/                    # Express Backend
│   ├── controllers/          # Route controllers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript types
│   ├── config/              # Configuration files
│   ├── scripts/             # Database scripts
│   ├── tests/               # Test files
│   ├── uploads/             # File uploads
│   ├── server.ts            # Server entry point
│   ├── package.json         # Server dependencies
│   ├── tsconfig.json        # TypeScript config
│   ├── jest.config.js       # Jest configuration
│   └── .env.example         # Environment variables template
├── package.json             # Root workspace config
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 8.x
- **MongoDB** (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tiffin-service-monorepo
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp client/.env.example client/.env
   cp server/.env.example server/.env

   # Edit the .env files with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - **Client**: http://localhost:5173
   - **Server**: http://localhost:3000

## 📜 Available Scripts

### Root Level Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Start both client and server in development mode |
| `npm run build` | 📦 Build both applications for production |
| `npm run start` | ▶️ Start production server |
| `npm run start:full` | 🔄 Start both production builds |
| `npm run lint` | 🔍 Lint both applications |
| `npm run lint:fix` | 🔧 Fix linting issues |
| `npm run format` | 💅 Format code with Prettier |
| `npm run test` | 🧪 Run all tests |
| `npm run test:watch` | 👀 Run tests in watch mode |
| `npm run type-check` | ✅ Check TypeScript types |
| `npm run clean` | 🧹 Clean all builds and dependencies |
| `npm run reset` | 🔄 Clean and reinstall everything |

### Client Commands

```bash
cd client

npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint React code
npm run lint:fix     # Fix linting issues
npm run type-check   # Check TypeScript types
```

### Server Commands

```bash
cd server

npm run dev          # Start development server
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run lint         # Lint server code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run type-check   # Check TypeScript types
```

## 🔧 Configuration

### Environment Variables

#### Client (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Tiffin Service
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

#### Server (.env)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tiffin_service
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### TypeScript Configuration

- **Client**: Modern React setup with strict type checking
- **Server**: Node.js optimized with path mapping
- **Shared**: Consistent TypeScript settings across workspaces

### Code Quality

- **ESLint**: Configured for both React and Node.js
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit checks (optional)

## 🏗️ Development Workflow

### 1. Feature Development
```bash
# Start development environment
npm run dev

# Work on both client and server
# Hot reload enabled for both workspaces
```

### 2. Code Quality
```bash
# Check code quality
npm run lint
npm run type-check

# Fix issues
npm run lint:fix
npm run format
```

### 3. Testing
```bash
# Run all tests
npm run test

# Watch mode for active development
npm run test:watch

# Coverage report
npm run test:coverage
```

### 4. Building for Production
```bash
# Build both applications
npm run build

# Start production servers
npm run start:full
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production --workspaces

# Copy source
COPY . .

# Build applications
RUN npm run build

# Expose ports
EXPOSE 3000 5173

# Start server
CMD ["npm", "start"]
```

## 🛡️ Security Features

- **Helmet.js** for security headers
- **CORS** properly configured
- **Rate limiting** implemented
- **Input validation** and sanitization
- **JWT** authentication
- **Password hashing** with bcrypt
- **File upload** security

## 📊 Features

### User Features
- 🔐 User authentication (register/login)
- 🍽️ Browse meal plans (veg/non-veg)
- 🛒 Order management
- 💳 Payment integration (Razorpay)
- 📱 Responsive design
- 🔔 Real-time notifications

### Admin Features
- 📊 Admin dashboard
- 🍜 Menu management
- 📋 Order tracking
- 👥 User management
- 📈 Analytics dashboard
- 🖼️ Image upload system

### Technical Features
- ⚡ Fast development with Vite
- 🎨 Modern UI with Tailwind CSS
- 📱 Mobile-first responsive design
- 🔄 Real-time updates
- 🧪 Comprehensive testing
- 📝 Full TypeScript support
- 🚀 Production-ready configuration

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run quality checks**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 📝 Code Style

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Husky** for git hooks (optional)

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Kill processes on ports
   npx kill-port 3000 5173
   ```

2. **Dependency issues**
   ```bash
   # Clean and reinstall
   npm run reset
   ```

3. **TypeScript errors**
   ```bash
   # Check types
   npm run type-check
   ```

4. **Build failures**
   ```bash
   # Clean builds
   npm run clean
   npm run build
   ```

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

### Environment Variables
- Copy `.env.example` files
- Fill in required values
- Restart development servers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- MongoDB team
- Tailwind CSS team
- All open-source contributors

---

**Happy Coding! 🚀✨**

For more information, visit our [documentation](docs/) or open an issue.