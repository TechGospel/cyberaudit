# CyberGuard - Cybersecurity Threat Monitoring Dashboard

A cybersecurity threat monitoring dashboard built with React, Express.js, and PostgreSQL. Features real-time threat detection, role-based access control, interactive analytics, and comprehensive audit logging.

## Features

- **Real-time Threat Monitoring**: Live threat detection with automatic updates
- **Interactive Analytics**: Timeline charts and geographic threat mapping
- **Role-Based Access Control**: Admin and analyst user roles with different permissions
- **Threat Management**: Block and resolve threats with detailed action logging
- **Comprehensive Audit Trail**: Track all user actions and system events
- **Modern UI**: Dark/light theme support with responsive design

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, JWT authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite, ESBuild
- **Deployment**: Vercel-ready configuration

## Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cyberguard-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `NODE_ENV`: development/production

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database with sample data**
   ```bash
   npx tsx server/seed.ts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Default Credentials

- **Admin**: username `admin`, password `admin`
- **Analyst**: username `analyst`, password `admin`

## Deployment on Vercel

This application is configured for easy deployment on Vercel:

### Prerequisites

1. **Database Setup**: Set up a PostgreSQL database (recommended: Neon, Supabase, or Railway)
2. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)

### Deployment Steps

1. **Push to GitHub**: Ensure your code is in a GitHub repository

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**:
   In your Vercel dashboard, add these environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   VERCEL=1
   ```

4. **Deploy**:
   - Click "Deploy" in Vercel
   - Your application will be built and deployed automatically
   - Access your live application at the provided Vercel URL

### Database Setup for Production

1. **Create a PostgreSQL database** using services like:
   - [Neon](https://neon.tech) (recommended for Vercel)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)

2. **Get your connection string** and add it to Vercel environment variables

3. **Run database migrations** after deployment:
   ```bash
   npm run db:push
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `NODE_ENV` | Environment mode (development/production) | Yes |
| `VERCEL` | Set to "1" for Vercel deployment | Vercel only |

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and configuration
├── server/              # Express.js backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
├── api/                 # Vercel serverless functions
└── dist/                # Build output
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Threats
- `GET /api/threats` - List threats (with filters)
- `GET /api/threats/:id` - Get threat details
- `PATCH /api/threats/:id` - Update threat status
- `POST /api/threats` - Create new threat (admin only)

### Analytics
- `GET /api/analytics/timeline` - Threat timeline data
- `GET /api/analytics/geographic` - Geographic threat data

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Audit Logs
- `GET /api/audit-logs` - System audit logs

### Administration
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `GET /api/settings` - System settings
- `PUT /api/settings` - Update settings (admin only)

