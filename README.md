# TMDB SvelteKit Frontend

A SvelteKit frontend for browsing movies and TV shows from TMDB. The app focuses on a clean media catalogue experience with trending content, paginated lists, detail pages, search, and graceful fallbacks for missing data.

## Environment variables

See `.env.example` for the required environment variables.

- `TMDB_API_KEY` is required to access the TMDB API.
- `VITE_DATE_LOCALE` controls the locale used by date formatting helpers.

## TMDB API key

To create your own TMDB API key, open the TMDB account settings page and follow the API key setup instructions:

- [TMDB API Settings](https://www.themoviedb.org/settings/api)
- [TMDB Getting Started](https://developer.themoviedb.org/docs/getting-started)

## Node.js versions

- SvelteKit: `^2.63.0`
- Node.js: `v26.6.0`
- npm: `11.18.0`

## Features

- Home page with trending movies and TV shows.
- Separate list pages for movies and TV shows.
- Detail pages with images, metadata, cast, and production information.
- Typeahead search for movies and TV shows.
- Restores the last visited page in paginated lists.
- Deduplicates items when loading more data.
- Shared fallback handling for missing images and text.
- Shared error dialog for API and load failures.
- Reusable components for cards, search, pagination, and error states.

## Tech stack

- SvelteKit 2.63.
- Svelte 5.
- Vite.
- Fomantic UI / Semantic UI classes.
- Playwright for end-to-end tests.
- Vitest for unit tests.
- Prettier and ESLint for formatting and linting.
- Sass for styles.

## Project structure

- `src/routes/` contains the pages and API routes.
- `src/lib/components/` contains reusable UI components.
- `src/lib/utils/` contains shared helpers for paging, deduplication, and formatting.
- `static/` contains static assets.
- `tests/` contains unit and integration test files.
- `e2e/` contains Playwright end-to-end tests.

## Pages and routes

- The home page shows trending content and supports loading more items.
- The movies page lists popular movie content with pagination and state restore.
- The TV shows page lists TV content with the same pagination behavior.
- Detail pages show movie and TV show information including cast, genres, runtime, and production companies.
- The search endpoint powers the typeahead component used in the layout navigation.

## Shared helpers

- `restorePagedList` restores paginated list state from session storage and loads more pages if needed.
- `getStoredPage` reads the last stored page number for a list.
- `deduplicateMedia` removes duplicate media items by `mediaType` and `id`.
- `getMediaKey` creates a stable key for media items.
- `deduplicateById` removes duplicate objects by `id`.
- `formatDate` formats dates according to the configured locale.

## Components

- `CardDefault` renders a standard media card.
- `CardFeatured` renders the highlighted media card.
- `DialogMessage` shows error messages in a consistent dialog.
- `LoadMore` loads additional items for paginated lists.
- `TypeHeadSearch` provides the live search dropdown.
- Fallback images and placeholder text are handled inside the shared components instead of repeating that logic in the pages.

## Error handling

- Missing API data is surfaced through the shared `DialogMessage` component.
- Missing images fall back to the shared placeholder asset.
- Missing text values are normalized inside the reusable components and detail pages.
- Detail pages and list pages keep rendering even when parts of the API response are incomplete.

## Pagination and restore flow

- Pagination state is stored in session storage so returning to a list restores the last page.
- The shared restore helper loads the initial page and continues loading until the stored page is reached.
- Duplicate media entries are filtered out before rendering.
- After loading more items, the page scrolls to the first newly inserted item.
- Navigation in the layout reuses the stored page value when returning to a list.


## Node.js scripts

These are the main `package.json` scripts:

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run preview` previews the production build locally.
- `npm run prepare` runs the SvelteKit sync step after install.
- `npm run lint` checks formatting and ESLint rules.
- `npm run format` formats the source files with Prettier.
- `npm run lint:fix` formats and auto-fixes lint issues.
- `npm run dev:e2e` starts the app on a fixed host and port for Playwright.
- `npm run test:e2e` runs the end-to-end test suite.
- `npm run test:e2e:ui` runs Playwright with the interactive UI.
- `npm run test:unit` runs the unit tests once.
- `npm run test:unit:watch` runs unit tests in watch mode.
- `npm run test:unit:coverage` runs unit tests with coverage output.
- `npm run test` is an alias for the unit test run.

## Getting started

```bash
npm install
npm run dev