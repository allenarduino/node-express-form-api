# Express React Auth Boilerplate

A full-stack application scaffold with a Node.js + TypeScript backend and React frontend.

## Project Structure

```
├── backend/             # Node.js + TypeScript API server
│   ├── src/            # Source code
│   ├── prisma/         # Database schema and migrations
│   ├── scripts/        # Utility scripts
│   └── dist/           # Compiled JavaScript (generated)
└── frontend/           # React frontend (to be added)
```

## Backend

The backend is a Node.js + TypeScript API server with Express, Prisma, and authentication utilities.

### Features

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **Authentication** - JWT + bcryptjs
- **Validation** - Zod schema validation
- **Email** - Nodemailer integration
- **Environment** - dotenv configuration

### Getting Started

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   npm run prisma:dev
   ```

### Development

Start the development server:
```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in your .env file).

### Building

Build the project:
```bash
cd backend
npm run build
```

Start the production server:
```bash
cd backend
npm start
```

## Available Scripts

- `cd backend && npm run dev` - Start development server with hot reload
- `cd backend && npm run build` - Compile TypeScript to JavaScript
- `cd backend && npm start` - Start production server
- `cd backend && npm run prisma:dev` - Run Prisma migrations

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-jwt-secret"
```

## License

Private project - All rights reserved.