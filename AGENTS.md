# AGENTS.md - Guidelines for Agentic Coding Agents

This file provides instructions for AI agents operating in this repository.

## Table of Contents
1. [Build, Lint, and Test Commands](#build-lint-and-test-commands)
2. [Code Style Guidelines](#code-style-guidelines)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Additional Notes](#additional-notes)

---

## Build, Lint, and Test Commands

### Package Scripts
See `package.json` for all available scripts.

#### Development
- `npm run dev` - Start Next.js development server
- `npm run api` - Alias for dev server

#### Building
- `npm run build` - Generate Prisma client and build Next.js app
- `npm run start` - Start Next.js production server

#### Linting
- `npm run lint` - Run ESLint on the entire project

#### Database Operations
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio GUI

#### Utility Scripts
- `npm run poll-stations` - Poll charging station data

### Running Tests
*Note: No test framework configured yet.*
When tests are added: `npm test` or `npm test -- path/to/test.ts`

### Type Checking
- Automatic during `npm run build`
- Manual: `npx tsc --noEmit`

---

## Code Style Guidelines

### Language
- **TypeScript** required for all new files (`.ts`/`.tsx`)
- Migrate JavaScript to TypeScript when touched

### File Size
- Maximum **400 lines** per file
- Split large components/modules

### Imports
1. **Order**:
   - External packages (react, next/*)
   - Internal absolute imports (@/)
   - Relative imports (., ..)
2. **Grouping**: Separate groups with blank lines
3. **Syntax**: Named imports for specific items, default for React components

### Formatting
- Prettier conventions (to be configured)
- Semicolons and single quotes
- Trailing commas in multi-line objects/arrays
- Maximum line length: 100 characters

### Types
- Prefer interfaces for extensible object shapes
- Use type aliases for unions, primitives, complex types
- Always type function parameters and return values
- Avoid `any`; use `unknown` when uncertain and validate
- Strict null checks (`null` ≠ `undefined`)

### Naming Conventions
- Files/directories: `kebab-case`
- Components/functions/variables: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Acronyms as words (`getEVRange`)

### Error Handling
- **Frontend**: React error boundaries where appropriate
- **Backend/API Routes**:
  - Use `try/catch` for async operations
  - Return appropriate HTTP status codes (4xx/5xx)
  - Log errors using provided logger
- **Validation**: Use Zod or similar for input validation

### Comments
- Use JSDoc for exported functions/components
- Explain why, not what (unless complex logic)
- Keep comments up-to-date; remove commented-out code
- Use `TODO:` and `FIXME:` tags with GitHub usernames

### CSS and Styling
- Use TailwindCSS for styling
- Avoid custom CSS; use Tailwind utilities
- For complex styles, create reusable components
- Use `@apply` sparingly (component abstraction only)
- Follow Tailwind's recommended class order

### React Specifics
- Use function components with hooks
- Prefer `useCallback` and `useMemo` for performance
- Use `useReducer` for complex state logic
- Handle loading and error states in data fetching
- Use React.memo only when profiling shows benefit

---

## Project Structure

### Root Level
- `/src` - Main source code
- `/prisma` - Prisma schema and migrations
- `/scripts` - Utility scripts
- `/tasks` - Task definitions and backlog
- `/docs` - Documentation
- `/mobile` - Mobile application (React Native)

### Source Code (`/src`)
- `/app` - Next.js 13+ app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions, API clients, helpers
- `/types` - TypeScript type declarations
- `/i18n` - Internationalization configuration
- `/middleware` - Next.js middleware
- `/navigation` - Navigation helpers

### Recommended Module Structure
```
src/modules/
  users/
  listings/
  ev_models/
  batteries/
  reviews/
  charging_stations/
  articles/
```
Each module may contain:
- `components/` - Module-specific components
- `lib/` - Module-specific utilities
- `types/` - Module-specific types
- `api/` - API route handlers (if applicable)

---

## Development Workflow

### Feature Implementation Order
Follow this sequence when implementing features:
1. **Database schema** - Update Prisma schema in `/prisma/schema.prisma`
2. **API endpoints** - Create route handlers in `/src/app/api/`
3. **Frontend UI** - Create pages in `/src/app/[locale]/` and components
4. **Search integration** - Integrate with Meilisearch (when implemented)
5. **Tests** - Write unit and integration tests

### Making Changes
1. Read `ROADMAP.md` for overall direction
2. Check `tasks/backlog.md` for next prioritized task
3. Implement minimal working feature
4. Update documentation if needed
5. Run `npm run lint` and fix any issues
6. Verify changes work in development (`npm run dev`)

### Environment Variables
- Copy `.env.example` to `.env.local` for development
- Never commit actual `.env` files
- Use `process.env` with proper type checking

### Database
- Use Prisma ORM for all database interactions
- Generate client after schema changes: `npm run db:generate`
- For development, use `npm run db:push` or migrations
- Seed data with `npm run db:seed`

---

## Additional Notes

### Performance
- Avoid premature optimization
- Bundle analysis: Use `next-bundle-analyzer` when needed
- Optimize images using Next.js `next/image`
- Implement proper caching headers in API routes

### Security
- Use `next-auth` for authentication
- Sanitize all user inputs
- Use Helmet via middleware for security headers
- Keep dependencies updated

### Internationalization
- Uses `next-intl` for i18n
- Messages stored in `/src/app/[locale]/` JSON files (when implemented)
- All user-facing strings must be wrapped in `useTranslations`

### Accessibility
- Follow WCAG 2.1 AA guidelines
- Use semantic HTML elements
- Ensure proper color contrast
- Implement keyboard navigation

### Testing Philosophy
- Write tests for complex business logic
- Mock external services
- Test edge cases and error conditions
- Prioritize integration tests over unit tests for user flows

### Deprecation
- Mark deprecated code with `@deprecated` JSDoc tag
- Remove deprecated code after two release cycles
- Update documentation when removing features

---
*Last updated: $(date)*
*This file should be updated as the project evolves.*