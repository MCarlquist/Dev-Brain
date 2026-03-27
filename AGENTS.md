# Dev Brain — AGENTS.md

## Project Overview
Dev Brain is a project-based developer knowledge base for storing and organizing:
- code snippets
- project notes
- useful links/resources

The app is meant for learning, personal use, and long-term expansion. It should also be suitable for publishing on GitHub as a portfolio-quality project.

## Product Direction
Dev Brain is **not** a task manager.
It should **not** focus on:
- task breakdowns
- task status
- task priority
- progress tracking

Its purpose is to help developers keep project-specific knowledge in one place.

## Core MVP
Users should be able to:
1. Create a project
2. View all projects
3. Open a specific project
4. Save code snippets under a project
5. Save notes under a project
6. Save links/resources under a project
7. Edit and delete snippets, notes, and links

## Data Model
### Project
- name
- description
- timestamps

### Snippet
- title
- description
- language
- code
- project relation
- timestamps

### Note
- title
- content
- project relation
- timestamps

### Link
- title
- url
- description
- project relation
- timestamps

## Recommended Stack
- TanStack Start
- TypeScript
- PostgreSQL
- Prisma
- Tailwind CSS
- shadcn/ui
- Zod

## UI Guidance
- Keep the interface clean and minimal
- Use shadcn/ui as the default component foundation for forms, dialogs, buttons, tabs, cards, and other common UI patterns
- Organize project content clearly
- Prefer tabs or clearly separated sections for:
  - Snippets
  - Notes
  - Links
- Prioritize usability over visual complexity

## TanStack Start Guidance
When building Dev Brain with TanStack Start:
- Use TanStack Start file-based routing for page structure
- Use server functions for data mutations and server-only business logic
- Validate all server function inputs with shared Zod schemas
- Keep secrets, database access, and sensitive logic server-side only
- Use appropriate HTTP methods for server functions and mutations
- Handle redirects, not-found states, and server errors explicitly
- Avoid hydration mismatches by keeping SSR-safe rendering patterns
- Prefer simple SSR-friendly data loading patterns before advanced optimizations
- Add middleware only for real cross-cutting concerns such as auth, logging, or request context
- If authentication is added later, protect routes at the route level and verify auth again in server functions

## Engineering Guidelines
- Keep components small and reusable
- Validate all form input on both client and server
- Use clear naming and predictable folder structure
- Favor simple CRUD before advanced abstractions
- Build the MVP first before adding advanced features
- Separate server-only code from client-rendered code
- Share validation schemas across forms and server functions where appropriate
- Prefer colocated, feature-oriented organization when it improves clarity

## Suggested File / Code Organization
Prefer a structure that keeps route UI, validation, and server logic easy to find.

Examples:
- Route files for project list and project detail pages
- Shared schema files for Project, Snippet, Note, and Link validation
- Server function files for create, update, and delete actions
- Reusable UI components for forms, lists, item cards, and section tabs

Conventions:
- Keep Prisma/database access in server-only modules
- Use dedicated server function files when it improves clarity
- Keep validation schemas reusable and close to the domain they validate
- Avoid mixing database logic directly into client UI components

## Suggested MVP Pages
1. Projects list page
2. Project detail page
3. Create/edit forms for project items

## Suggested MVP Feature Shape
### Projects List
- Show all projects
- Allow creating a new project
- Display name, description, and basic timestamps if useful

### Project Detail
- Show project metadata
- Separate Snippets, Notes, and Links into clear sections or tabs

- Allow create, edit, and delete actions for each item type

### Forms
- Reuse consistent validation and error display patterns
- Prefer straightforward forms over highly abstract form systems in the MVP

## Data and Validation Rules
- Validate all user input with Zod or equivalent schema validation
- Enforce validation on both client and server
- Validate URLs for Link records
- Validate language/title/code fields for Snippets
- Keep schemas aligned with Prisma models and form inputs

## Security and Reliability
- Never expose secrets or direct database credentials to the client
- Keep all database writes behind server functions
- Sanitize and validate all user-controlled input
- Plan for CSRF protection and secure cookie handling if auth is introduced
- Return clear error states instead of failing silently

## Future Enhancements
Possible future features:
- tags
- global search
- syntax highlighting
- markdown notes
- favorites/pinning
- export/import
- CLI capture tool
- browser extension for saving links
- AI-assisted organization or summarization

## Portfolio Goal
The project should demonstrate:
- fullstack TypeScript development
- relational data modeling
- clean CRUD design
- thoughtful UI/UX
- room for future extensibility
- competent TanStack Start patterns across routing, server functions, validation, and SSR-aware UI

## Agent Instructions
When contributing to Dev Brain:
- preserve the product scope
- avoid reintroducing task-management features unless explicitly requested
- optimize for clarity, maintainability, and portfolio quality
- prefer incremental, well-scoped implementation steps
- prefer TanStack Start best practices for routing, server functions, middleware, and SSR
- use shared validation schemas and server-side input validation by default
- keep server-only concerns out of client components
- choose simple, readable patterns over clever abstractions for the MVP
