# Kiswahili Mastery - Faith-Based Learning Platform

## Overview

This is a full-stack web application built for faith-based Kiswahili language learning. The platform provides interactive courses, progress tracking, and community features designed to help users learn Kiswahili through a Christian perspective. The application supports multiple languages (English and Kiswahili) and includes both light and dark themes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and React Context for global state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with JSON responses

### Database Architecture
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with type-safe queries
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Security**: HTTP-only cookies with secure flags

### Course Management
- **Course Structure**: Hierarchical courses with lessons and categories
- **Progress Tracking**: Individual lesson progress with watch time and completion status
- **Enrollment System**: User enrollment tracking with progress percentages
- **Content Types**: Support for text, audio, and video content

### UI/UX Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Theme System**: Light/dark mode with system preference detection
- **Internationalization**: English and Kiswahili language support
- **Accessibility**: Radix UI components with proper ARIA attributes

### Data Models
- **Users**: Profile management with preferences and authentication data
- **Courses**: Course metadata with categories, levels, and ratings
- **Lessons**: Individual lesson content with duration and media URLs
- **Progress**: Granular progress tracking per user per lesson
- **Enrollments**: Course enrollment status and overall progress

## Data Flow

1. **Authentication Flow**:
   - User redirects to `/api/login` for Replit Auth
   - OIDC provider validates and returns user data
   - Session created and stored in PostgreSQL
   - User profile upserted in database

2. **Course Access Flow**:
   - Authenticated users can browse all courses
   - Enrollment required for lesson access
   - Progress automatically tracked during lesson playback
   - Completion status updated in real-time

3. **Content Delivery**:
   - Static assets served through Vite in development
   - API endpoints provide structured JSON data
   - Real-time progress updates through optimistic updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection and pooling
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI primitive components
- **drizzle-orm**: Type-safe database queries and migrations
- **express**: Web server framework
- **passport**: Authentication middleware
- **wouter**: Lightweight client-side routing

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development Environment
- **Server**: Vite dev server with HMR
- **Database**: Neon PostgreSQL with connection pooling
- **Authentication**: Replit Auth with development configuration
- **Hot Reloading**: Full-stack hot reloading with Vite

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild compilation to single bundle
- **Database**: Production PostgreSQL with SSL
- **Process**: Single Node.js process serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPLIT_DOMAINS**: Allowed domains for OIDC
- **ISSUER_URL**: OpenID Connect issuer endpoint

The application is designed to scale with the addition of more course content, user management features, and advanced progress tracking capabilities. The modular architecture allows for easy extension of functionality while maintaining type safety and performance.