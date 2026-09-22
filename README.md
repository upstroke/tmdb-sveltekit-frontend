# TMDB SvelteKit Frontend

A SvelteKit frontend for browsing movies and TV shows from the TMDB API.

The application provides a media catalog with trending sections, paginated lists, detail pages, localized typeahead search, and fallback mechanisms for missing data.

## Project Goal

This project serves as a frontend for a TMDB-based media catalog.

Its focus is on:

- clear presentation of movies and TV shows
- reusable Svelte components
- robust handling of incomplete API data
- clean separation of UI, utility logic, and service layers
- a maintainable and testable architecture
- accessibility compliance (WCAG 2.2 AA)

## Features

- Homepage with trending movies and TV shows
- Separate overview pages for movies and TV shows
- Detail pages with images, metadata, cast, and production information
- Typeahead search for movies and TV shows
- Localized interface
- Language switching through the global header
- Typeahead search automatically repeated in the newly selected language when a search term is active
- Search results use the currently active locale when clicked, even if the results were loaded before the language changed
- Locale propagation through internal navigation and server-side data requests
- Restoration of the last visited page in paginated lists
- Duplicate removal when loading additional data
- Shared fallback logic for missing images and text
- Shared error dialog for API and loading errors
- Reusable components for cards, search, pagination, and error states

## Internationalization

Translation catalogs for UI text and rating formats are stored separately in:

- `src/lib/i18n/ui.json`
- `src/lib/i18n/ratings.json`

Locale logic is located in:

- `src/lib/i18n/helpers.js` for supported locales and fallbacks
- `src/lib/stores/locale.js` for the active language state
- `src/lib/stores/i18n.js` for access to loaded translations

The current route is preserved when the language changes. If the typeahead search contains a search term of at least four characters, the results are automatically reloaded using the new locale.

## Streaming Data

The displayed streaming providers and watch links are supplied through the TMDB API. The streaming data comes from JustWatch and is labeled "Provided by JustWatch" on movie and TV show detail pages.

## Tech Stack

- SvelteKit 2.63
- Svelte 5
- Vite
- Fomantic UI / Semantic UI classes
- Playwright for acceptance tests (including accessibility)
- Vitest for component, integration, and unit tests
- Prettier and ESLint for formatting and code quality
- Sass for styles

## Requirements

- Node.js `v26.6.0`
- npm `11.18.0`

## Environment Variables

The required environment variables are documented in `.env.example`.

The most important ones are:

- `TMDB_API_KEY`  
  API key for accessing the TMDB API

- `VITE_DEFAULT_LOCALE`  
  Locale used for date formatting

*After adding the API key, rename the file to `.env`.*

## TMDB API Key

You can create your own API key in your TMDB account:

- [TMDB API Settings](https://www.themoviedb.org/settings/api)
- [TMDB Getting Started](https://developer.themoviedb.org/docs/getting-started)

## Installation and Startup

```bash
npm install
npm run dev
```

Alternatively, the most important project commands can be run through `just`. `just` must be installed globally, for example with Homebrew:

```bash
brew install just
```

The project includes a `justfile` in the project root. Examples:

```bash
just dev
just build
just lint
just format
just test-vitest
just test-e2e
```

The most important npm scripts for formatting and code quality are:

```bash
npm run format
npm run format:check
npm run lint:eslint
npm run lint
npm run lint:fix
```

- `npm run format` formats files under `src` with Prettier.
- `npm run format:check` checks formatting without changing files.
- `npm run lint:eslint` runs ESLint exclusively for `src`.
- `npm run lint` combines the Prettier check with ESLint.
- `npm run lint:fix` formats the source code and automatically fixes possible ESLint issues.

The `just` commands are shortcuts for the npm scripts in `package.json`. The actual command definitions therefore remain in `package.json`; when adding or changing npm scripts, check the `justfile` and update it if necessary.

## Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```text
src/
  routes/
  lib/
    components/
    i18n/
    services/
    stores/
    utils/

static/

tests/

docs/
```

## Testing

The testing overview, commands, directory structure, and detailed test-level guidance are documented in [docs/testing.md](docs/testing.md).

Detailed Playwright end-to-end acceptance-test plans remain next to their executable specifications in `tests/acceptance/<feature>/`.

## Documentation

- `docs/testing.md` for testing strategy, commands, and test-level guidance
- `docs/ai-prompts.md` for AI-assisted development rules
- `docs/ai-prompt-examples.md` for example prompts
