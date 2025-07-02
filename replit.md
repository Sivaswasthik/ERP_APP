# Enterprise ERP System

## Overview

This is a full-stack Enterprise Resource Planning (ERP) system built with React, Express.js, PostgreSQL, and TypeScript. The application provides comprehensive business management functionality including inventory management, sales tracking, human resources, and financial management. It features role-based authentication through Replit Auth and uses modern UI components for a professional user experience.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Custom components built with Radix UI primitives and Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with TypeScript interfaces

### Database Architecture
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Database**: Neon PostgreSQL (serverless)
- **Migrations**: Automated schema management via Drizzle Kit
- **Schema**: Centralized in `shared/schema.ts` for type safety across client and server

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OIDC
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Role-based Access**: Admin, Manager, and Staff roles with different permissions
- **Security**: HTTP-only cookies with secure session management

### Data Layer
- **Products**: Full CRUD operations for inventory management
- **Orders**: Sales and purchase order tracking with status management
- **Employees**: HR management with role-based access controls
- **Transactions**: Financial transaction recording and categorization
- **Users**: Integrated user management with Replit Auth

### UI Components
- **Design System**: Shadcn/ui components with custom theming
- **Layout**: Responsive sidebar navigation with role-based menu filtering
- **Forms**: Standardized form components with validation
- **Tables**: Data tables with search, filtering, and action capabilities
- **Dashboard**: KPI cards and analytics visualization

### Business Modules
- **Inventory Management**: Product catalog, stock tracking, category management
- **Sales & Purchases**: Order processing, customer management, status tracking
- **Human Resources**: Employee onboarding, department management, status tracking
- **Finance**: Transaction recording, categorization, basic reporting

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **API Requests**: Client makes authenticated requests to Express server
3. **Data Validation**: Zod schemas validate data on both client and server
4. **Database Operations**: Drizzle ORM handles all database interactions
5. **State Management**: TanStack Query manages server state and caching
6. **UI Updates**: React components re-render based on query state changes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon
- **drizzle-orm**: TypeScript-first ORM with excellent type safety
- **@tanstack/react-query**: Powerful data synchronization for React
- **wouter**: Minimalist React router
- **zod**: TypeScript-first schema validation

### UI Dependencies
- **@radix-ui/***: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Consistent icon library
- **class-variance-authority**: Type-safe component variants

### Development Dependencies
- **tsx**: TypeScript execution for development
- **vite**: Fast build tool with HMR
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Server**: tsx for TypeScript execution with hot reload
- **Client**: Vite development server with HMR
- **Database**: Neon PostgreSQL with environment-based connection

### Production Build
- **Client**: Vite builds optimized static assets to `dist/public`
- **Server**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command
- **Deployment**: Single process serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPL_ID**: Replit environment identifier
- **NODE_ENV**: Environment mode (development/production)

Changelog:
```
Changelog:
- July 02, 2025. Initial setup
```

User Preferences:
```
Preferred communication style: Simple, everyday language.
```