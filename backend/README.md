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

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
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
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in your .env file).

### Building

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
├── src/                 # Source code
├── prisma/             # Database schema and migrations
├── scripts/            # Utility scripts
├── dist/               # Compiled JavaScript (generated)
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:dev` - Run Prisma migrations

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-jwt-secret"
```

## License

Private project - All rights reserved.
