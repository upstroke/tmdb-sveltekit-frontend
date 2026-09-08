# Integration Tests with Vitest

## Scope

Integration tests belong in `tests/integration/`.

- Use `tests/integration/components/` for Svelte component tests.
- Use `tests/integration/routes/` for route-related behavior that can be tested without a complete browser-based acceptance flow.

Use integration tests when behavior emerges from the interaction of multiple parts, such as components with stores, helpers with services, route logic with data mapping, or user interactions with controlled dependencies.

## Component Tests

- Use the established Svelte Testing Library and Vitest setup.
- The project uses the official `svelteTesting()` Vite plugin from `@testing-library/svelte/vite` for Svelte 5 component tests.
- Prefer accessible, user-oriented queries such as `getByRole`, `getByLabelText`, and `getByText` where appropriate.
- Assert visible output, accessibility attributes, emitted behavior, and user-triggered interactions.
- Avoid assertions about internal component variables, private implementation details, or incidental DOM structure.
- Use the existing interaction pattern for realistic user interactions where applicable.
- Ensure cleanup follows the existing project setup and utilities.
- For Svelte-specific implementation or testing behavior that is not already established in the repository, consult the current official Svelte, SvelteKit, and Svelte Testing Library documentation before implementation.
- Prefer Svelte 5 patterns that match the versions installed in this project.
- Do not copy generic examples blindly; adapt them to the existing project setup, including the configured `svelteTesting()` plugin and test utilities.

## Route Integration Tests

- Test route data processing, error and fallback behavior, locale propagation, and interactions between route-level modules with controlled dependencies.
- Mock network boundaries rather than calling TMDB or other uncontrolled external services.
- Keep complete browser navigation flows, responsive behavior, and end-user workflows in Playwright end-to-end acceptance tests.

## Commands

```bash
npm run test:components
npm run test:integration
npm run test
```
