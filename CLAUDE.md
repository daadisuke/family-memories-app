# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a family photo management web application that allows families to organize, share, and search photos using AI-powered tagging. The project uses Next.js (App Router), Supabase for database and storage, and will integrate Claude AI for photo tagging.

**Current Status**: Documentation and planning phase. The codebase has not been implemented yet - only comprehensive documentation exists in `/docs`.

## Technology Stack

- **Frontend**: Next.js 16 with App Router, TypeScript, Tailwind CSS, Turbopack
- **Backend API**: Next.js Route Handlers (REST API)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase Storage (for photos)
- **Authentication**: NextAuth.js with Google OAuth
- **Deployment**: Vercel (frontend), Render/Railway (future FastAPI backend)
- **AI Processing**: FastAPI + Claude API (future implementation)
- **Development Tools**: Next.js DevTools MCP, Supabase MCP, Vercel MCP, Chrome DevTools MCP

## Development Commands

Since the project is not yet initialized, these are the planned commands once setup is complete:

```bash
# Development
npm run dev              # Start development server on localhost:3000
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues automatically
npm run type-check       # Run TypeScript type checking
npm run format           # Format code with Prettier

# Testing (future)
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

## Architecture & Key Concepts

### Database Architecture

The application uses a family-centric data model:

- **families** table: Top-level grouping for family units
- **users** table: Individual users linked to a family via `family_id`
- **photos** table: Photo metadata with `family_id` and `user_id` foreign keys
- **tags** table: AI-generated tags for photos (future implementation)

**Critical**: Row Level Security (RLS) policies enforce that:
- Users can only view photos belonging to their family group
- Users can only upload photos to their own family
- Users can only modify/delete their own uploads

See `docs/database-schema.md` for complete schema with RLS policies.

### Project Structure (Planned)

```
app/
  (auth)/              # Route group for authentication pages
  (dashboard)/         # Route group for authenticated pages (home, photos, albums, etc.)
  api/                 # API Route Handlers
  layout.tsx           # Root layout
  globals.css          # Global styles

components/
  layout/              # Header, Sidebar, Navigation
  photos/              # Photo-specific components
  albums/              # Album-specific components
  common/              # Shared components

lib/
  auth.ts              # NextAuth configuration
  supabase.ts          # Supabase client initialization
  db/                  # Database query functions
  storage/             # Supabase Storage operations
  utils/               # Utility functions
  validations/         # Zod/validation schemas

hooks/                 # Custom React hooks
types/                 # TypeScript type definitions
docs/                  # Comprehensive project documentation
```

### Component Patterns

- **Server Components**: Use for data fetching, SEO-critical pages, pages in `app/` directory
- **Client Components**: Add `'use client'` directive for interactivity, state, browser APIs
- **Import Aliases**: Use `@/` prefix (e.g., `@/components/common/Button`, `@/lib/supabase`)

### API Design

All API routes follow REST conventions:
- Authentication required via NextAuth session
- Error responses use consistent format: `{ error: "ErrorType", message: "..." }`
- Pagination supported on list endpoints with `page`, `limit`, `sortBy`, `order` params
- See `docs/api-spec.md` for complete endpoint specifications

## MCP (Model Context Protocol) Integration

This project is designed to be developed efficiently using MCP servers. Five MCP servers are configured:

1. **Next.js DevTools MCP** (`@next/devtools-mcp`) - **NEW in Next.js 16**
   - AI-assisted debugging with contextual insights
   - Project structure analysis
   - Build error diagnosis
   - Performance bottleneck identification
   - Routing information retrieval

2. **Next.js MCP** (`@modelcontextprotocol/server-nextjs`)
   - Project initialization and configuration
   - Page/component/API route creation
   - Configuration file management

3. **Supabase MCP** (`@modelcontextprotocol/server-supabase`)
   - Database table creation and schema management
   - RLS policy configuration
   - Storage bucket management
   - Query execution

4. **Vercel MCP** (`@modelcontextprotocol/server-vercel`)
   - Deployment management
   - Environment variable configuration
   - Preview deployment URLs
   - Deployment logs and status

5. **Chrome DevTools MCP** (`@modelcontextprotocol/server-chrome-devtools`)
   - DOM inspection and validation
   - Performance measurement (Core Web Vitals)
   - Console error checking
   - Responsive design verification

**Important**: When creating database tables, API routes, or deploying changes, leverage these MCP tools following the workflows documented in `docs/mcp-guide.md`.

## Development Workflow

### Starting a New Feature

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Review relevant documentation in `/docs`:
   - `database-schema.md` for data model changes
   - `api-spec.md` for API endpoint patterns
   - `project-structure.md` for file placement
3. If database changes needed, use Supabase MCP to create tables/columns
4. Use Next.js MCP to scaffold components and API routes
5. Test locally with `npm run dev`
6. Verify with Chrome DevTools MCP (DOM structure, console errors, performance)
7. Commit with conventional commit format: `feat:`, `fix:`, `docs:`, etc.
8. Push and create PR with preview deployment (automatic via Vercel)

### Database Migrations

When modifying the database schema:
1. Update `docs/database-schema.md` first
2. Create SQL migration file in `docs/sql/migrations/`
3. Apply locally using Supabase MCP
4. Update TypeScript types in `types/database.ts`
5. Update RLS policies if needed
6. Test queries thoroughly before production deployment

## Important Files & Documentation

All project documentation is in the `/docs` directory:

- **docs/README.md**: Documentation index and quick start guide
- **docs/requirement.md**: Full requirements, user stories, success metrics
- **docs/database-schema.md**: Complete database schema with RLS policies, indices, and query examples
- **docs/api-spec.md**: REST API specifications with request/response examples
- **docs/project-structure.md**: Directory structure and naming conventions
- **docs/workflow.md**: Development workflows for features, bugs, migrations, performance optimization
- **docs/mcp-guide.md**: MCP usage patterns and integrated workflows
- **docs/setup.md**: Initial setup instructions (when starting implementation)
- **docs/tasks.md**: Project task management and progress tracking
- **docs/nextjs-16-upgrade.md**: Next.js 16 upgrade guide with DevTools MCP setup

**IMPORTANT: Always reference these docs** when implementing features to ensure consistency with the planned architecture.

### Documentation Usage Guidelines

**CRITICAL**: The `/docs` directory contains comprehensive, authoritative documentation for this project. You MUST reference these documents throughout development to ensure consistency with the planned architecture.

1. **Before Starting Any Task**:
   - **REQUIRED**: Check `docs/tasks.md` for task details and context
   - **REQUIRED**: Review relevant documentation (`database-schema.md`, `api-spec.md`, etc.)
   - Understand the requirements and constraints
   - Never start implementation without consulting the relevant docs

2. **During Implementation**:
   - **Continuously reference** `/docs` as needed throughout the implementation
   - Follow patterns defined in `docs/project-structure.md`
   - Reference `docs/api-spec.md` for API endpoint design
   - Use `docs/mcp-guide.md` for MCP tool usage
   - Consult `docs/workflow.md` for development processes
   - When in doubt about any architectural decision, check the docs first

3. **After Completing a Task**:
   - **CRITICAL**: Update `docs/tasks.md` and mark the task as completed (check the checkbox)
   - **REQUIRED**: Review `docs/tasks.md` to verify the task is properly marked as done
   - Update relevant documentation if you made architectural changes
   - Document any issues or learnings for future reference
   - Confirm that all checkboxes for completed subtasks are checked

## Critical Implementation Notes

### Authentication & Security
- All API routes must verify NextAuth session before processing
- Use `getServerSession(authOptions)` in Route Handlers
- Never expose Supabase service role key in client-side code
- Always use RLS policies - never bypass with service role in user-facing endpoints
- Storage paths must include `family_id` to enforce access control

### Photo Upload Flow
1. Validate file type and size on client
2. Upload to Supabase Storage bucket `photos` at path: `{family_id}/{uuid}.{ext}`
3. Extract EXIF metadata (taken_at, location) if available
4. Insert metadata record into `photos` table
5. Return signed URL for immediate display
6. Queue for AI processing (future implementation)

### Performance Considerations
- Use Next.js Image component for all photos
- Implement pagination on photo lists (default 50 per page)
- Add GIN index on `tags` array column for fast tag searches
- Use `uploaded_at DESC` and `taken_at DESC` indices for common queries
- Consider lazy loading and virtual scrolling for large galleries

## Family Structure

The application supports a hierarchical family structure as defined in requirements:
- 夫 (Husband)
- アンディ (Andy) - にくなる
- 妻 (Wife)
- テディ (Teddy)
- 赤ちゃん (Baby)

All family members share access to the same photo collection through the `family_id` foreign key.

## Development Phases

**Phase 1 (MVP)**: Basic auth, photo upload, gallery view, Supabase setup
**Phase 2**: Family accounts, search (date/tags), bulk upload, responsive design
**Phase 3**: FastAPI backend, AI auto-tagging, person recognition
**Phase 4**: Performance optimization, image compression, albums, sharing links

Current focus should be on Phase 1 implementation following the detailed specifications in the documentation.

## Git Workflow

- **Branch naming**: `feature/`, `fix/`, `docs/`, `refactor/`
- **Commit format**: Conventional Commits (feat, fix, docs, style, refactor, test, chore)
- **PR requirements**:
  - Link related issue
  - Include description and test checklist
  - Verify preview deployment
  - Pass lint and type checks
- **Merge strategy**: Squash and merge preferred

## Environment Variables

Required environment variables (create `.env.local` from `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Claude API (for future AI features)
ANTHROPIC_API_KEY=
```

## When in Doubt

1. Check the comprehensive documentation in `/docs`
2. Follow the MCP workflows in `docs/mcp-guide.md` for common tasks
3. Reference the database schema and API specs for data structures
4. Use the project structure guide for file placement decisions
5. Follow the development workflow for standard processes

The documentation is extensive and authoritative - always consult it before making architectural decisions.
