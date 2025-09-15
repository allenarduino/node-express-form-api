# Express React Auth Boilerplate

A Node.js + TypeScript project scaffold with Express, Prisma, and authentication utilities.

## Features

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **Authentication** - JWT + bcryptjs
- **Validation** - Zod schema validation
- **Email** - Nodemailer integration
- **Environment** - dotenv configuration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Docker & Docker Compose (for containerized setup)

### Quick Start with Docker (Recommended)

1. Clone the repository
2. Start the development environment:
   ```bash
   make run-dev
   ```
   Or using Docker Compose directly:
   ```bash
   docker-compose up -d app-dev db
   ```

3. The API will be available at `http://localhost:4001`

### Local Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   npm run prisma:dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:4000` (or the PORT specified in your .env file).

### Building

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

### Docker Commands

```bash
# Start development environment
make run-dev

# Start production environment  
make run-local

# Stop all services
make down-local

# View logs
make logs

# Run database migrations
make migrate

# Run tests
make test

# Clean up everything
make clean
```

For detailed Docker instructions, see [README-Docker.md](./README-Docker.md).

## Project Structure

```
├── src/                 # Source code
├── prisma/             # Database schema and migrations
├── tests/              # Integration tests
├── dist/               # Compiled JavaScript (generated)
├── Dockerfile          # Container definition
├── docker-compose.yml  # Multi-container setup
├── Makefile           # Convenience commands
├── .dockerignore      # Docker build exclusions
└── package.json       # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:dev` - Run Prisma migrations
- `npm test` - Run integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Environment Variables

Create a `.env` file in the backend directory using `env.example` as a template:

```bash
cp env.example .env
```

Required variables:
```env
# Database
DATABASE_URL=mysql://app_user:app_password@localhost:3307/express_react_auth

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (choose one)
EMAIL_PROVIDER=resend
EMAIL_FROM=Auth Starter <onboarding@resend.dev>
RESEND_API_KEY=your-resend-api-key-here

# OR for SMTP
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# App Configuration
APP_URL=http://localhost:4001
PORT=4000
NODE_ENV=development
```

**Important**: Never commit your `.env` file to version control. The `env.example` file is provided as a template.

## License

Private project - All rights reserved.
