# Family Memories App

A family photo management web application that allows families to organize, share, and search photos using AI-powered tagging.

## Production URL

🚀 **Live App**: [https://family-memories-app-phi.vercel.app](https://family-memories-app-phi.vercel.app)

## Technology Stack

- **Frontend**: Next.js 16 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js Route Handlers (REST API)
- **Database**: Supabase PostgreSQL with RLS
- **Storage**: Supabase Storage
- **Authentication**: NextAuth.js with Google OAuth
- **Deployment**: Vercel

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Documentation

Comprehensive project documentation is available in the `/docs` directory:

- [Requirements](./docs/requirement.md) - Full requirements and user stories
- [Setup Guide](./docs/setup.md) - Initial setup instructions
- [Database Schema](./docs/database-schema.md) - Complete database schema with RLS
- [API Specification](./docs/api-spec.md) - REST API endpoints
- [Project Structure](./docs/project-structure.md) - Directory structure guide
- [Development Workflow](./docs/workflow.md) - Development processes
- [MCP Guide](./docs/mcp-guide.md) - MCP usage patterns
- [Tasks](./docs/tasks.md) - Project task management

## Deployment

This project is automatically deployed to Vercel. Every push to the `develop` branch triggers a deployment.

- **Production**: [https://family-memories-app-phi.vercel.app](https://family-memories-app-phi.vercel.app)
- **Dashboard**: [Vercel Project](https://vercel.com/daadisukes-projects/family-memories-app)
