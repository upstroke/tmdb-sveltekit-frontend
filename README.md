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
- a testable architecture with acceptance, component, integration, and unit tests

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

The displayed streaming providers and watch links are supplied through the TMDB API. The streaming data comes from JustWatch and is labeled “Provided by JustWatch” on movie and TV show detail pages.

## Testing Note

For Svelte 5 component tests with Vitest, the browser resolver condition is enabled in test mode. This causes Vitest to load the browser version of the Svelte modules and avoids the `mount(...) is not available on the server` error in jsdom-based UI tests.

## Testing Note

For Svelte 5 component tests with Vitest, the official `svelteTesting()` Vite plugin from `@testing-library/svelte/vite` is used. It automatically adds cleanup and the browser resolver condition to the DOM-based test environment, allowing UI tests under `jsdom` to load the browser version of the Svelte modules correctly.

## Tech Stack

- SvelteKit 2.63
- Svelte 5
- Vite
- Fomantic UI / Semantic UI classes
- Playwright for acceptance tests
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
  acceptance/
  components/
  integration/
  unit/
  fixtures/
  mocks/
  setup/

coverage/ (created when needed)
playwright-report/ (created when needed)
test-results/ (created when needed)
```

## Test Documentation

This file describes the pragmatic testing approach for the project.  
[Test documentation and testing approach](docs/testing.md)

## Important Directory Roles

- `src/routes/` contains pages and server-side routes
- `src/lib/components/` contains reusable UI components
- `src/lib/i18n/` contains translation catalogs and locale helper logic
- `src/lib/services/` contains service logic for external data sources such as TMDB
- `src/lib/stores/` contains global state such as locale and translations
- `src/lib/utils/` contains utility functions for formatting, pagination, and duplicate handling
- `static/` contains static assets
- `tests/` contains all automated tests organized by test level
- `coverage/` is created as needed by Vitest coverage runs
- `playwright-report/` contains the HTML output of Playwright tests
- `test-results/` contains runtime artifacts and error output from Playwright

## Pages and Routes

- The homepage displays trending content and supports loading more content.
- The movie page lists movie content with pagination and restore logic.
- The TV show page lists TV content with the same pagination logic.
- Detail pages display information about movies and TV shows, including cast, genres, runtime, and production companies.
- The search route provides the localized typeahead search in the main navigation.
- The `locale` query parameter is passed to pages, API routes, and detail navigation.

## Core Components

- `HeaderMain` renders global navigation, the mobile menu toggle, and the language switcher.
- `LanguageSwitcher` changes the active locale and reloads the current route in the new language.
- `FooterMain` provides the global footer as a dedicated layout component.
- `DetailsHero` encapsulates the shared hero/poster area of movie and TV show detail pages.
- `CardDefault` renders a standard media card.
- `CardFeatured` renders a featured media card.
- `DialogMessage` displays errors consistently.
- `LoadMore` loads additional entries in paginated lists.
- `TypeHeadSearch` provides live search, localizes search results, and starts the search again after a language change.

Global styles are loaded through `src/css/app.scss`. This file imports Fomantic UI, global Sass variables, and application-wide styles; component-specific styles remain in their respective `.svelte` components.

Fallback images and placeholder text are handled centrally within the components so the same logic does not have to be duplicated across multiple pages.

## Important Utility Functions

- `restorePagedList` restores the state of paginated lists from Session Storage.
- `getStoredPage` reads the last stored page number for a list.
- `deduplicateMedia` removes duplicate media entries based on `mediaType` and `id`.
- `getMediaKey` creates stable keys for media entries.
- `deduplicateById` removes duplicate objects based on their ID.
- `formatDate` formats date values according to the configured locale.
- `resolveLocale` validates locales and falls back to the default language for unknown values.

## Error Handling

- Missing API data is made visible through the shared `DialogMessage` component.
- Missing images fall back to a shared placeholder asset.
- Missing text values are normalized in components and detail pages.
- List and detail pages remain usable whenever possible, even with incomplete API responses.

## Pagination and Restore Behavior

- Pagination state is stored in Session Storage.
- When returning to a list, the last visited page is restored.
- The restore logic loads additional pages as needed until the stored state is reached.
- Duplicate media entries are filtered before rendering.
- After loading more content, the view scrolls to the first newly inserted position.

## Mobile Menu

On mobile views, `HeaderMain` uses a checkbox as the menu toggle. A `pointerdown` handler on the window checks whether the click occurred outside the header and automatically closes an open menu.

Clicks on the burger button and navigation remain inside the header and are therefore not treated as outside clicks.

## Quality Assurance

Before committing, at least the following commands should complete successfully:

```bash
npm run lint
npm run build
npm test
```

`npm run lint` checks Prettier and ESLint for the entire `src` directory. The `svelte/no-navigation-without-resolve` rule is disabled because the project handles internal and external URLs differently depending on the destination.

When changing translations, check all supported locale catalogs for identical keys.

## Test Strategy

The test structure is organized by test type and functional level, not by technical aids such as mocks or fixtures.

### Test Levels

- `tests/acceptance/`  
  Acceptance tests with Playwright for functional user flows

- `tests/integration/components/`  
  Component tests with Vitest for isolated Svelte components

- `tests/integration/`  
  Integration tests with Vitest for services, feature logic, and interactions between multiple parts

- `tests/unit/`  
  Small unit tests for pure utility functions and clearly isolated logic

### Helper Directories

- `tests/fixtures/`  
  fixed test data that can be reused across multiple tests

- `tests/mocks/`  
  mock functions or replacement behavior for external dependencies

- `tests/setup/`  
  shared test helpers and project-wide test preparation

These directories are not separate test types; they are helper structures only.

### Guiding Principle

Test coverage should follow practical agile development as closely as possible:

1. A user story or use case describes the desired behavior.
2. Acceptance tests verify the complete user flow.
3. Component and integration tests verify the interaction between the involved parts.
4. Unit tests protect pure utility functions and edge cases.