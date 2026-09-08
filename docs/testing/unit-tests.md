# Unit Tests with Vitest

## Scope

Unit tests belong in `tests/unit/`.

Use them for pure utility functions, isolated transformation logic, formatters, locale helpers, stores with narrowly controlled dependencies, route helpers, TMDB API helper logic, and relevant edge cases.

Domain subdirectories such as `tests/unit/routes/` and `tests/unit/tmdb-api/` may be used when they improve discoverability. Small, broadly used helpers may remain directly in `tests/unit/`.

## Rules

- Test one isolated unit or a small cohesive function group.
- Do not start a browser, development server, or full application.
- Prefer direct input/output assertions for pure functions.
- Stub or mock technical dependencies only when isolation requires it.
- Cover relevant normal, fallback, invalid, boundary, and error cases.
- Use meaningful `describe` and `it` blocks that state behavior directly.
- A test describes its behavior directly in the test file. Do not use additional metadata files or a test generator for unit-test documentation.
- Comments are allowed when they briefly explain the functional goal of a test case.

## Coverage and Classification

- Use the ISTQB terms `statement coverage` and `branch coverage` in prompts and test comments.
- For new tests, every executable statement in the affected source code should be executed at least once. Aim for 100% statement coverage of newly affected executable code.
- Add branch-coverage cases deliberately where alternative, error, fallback, boundary, or rejection branches are functionally or technically relevant.
- Do not add duplicate cases without a clearly new decision branch or behavioral risk.
- Each `it` block receives exactly one short classification comment directly above it.
- Analyze tests for a source file in a fixed order while collecting statement IDs already covered.
- Classify a test as `statement coverage` as soon as it contributes at least one new statement ID toward 100% statement coverage of the source file.
- Classify a test as `branch coverage` only when it contributes no new statement ID but checks an additional functionally or technically relevant decision path.
- Do not use mixed labels. An additional branch check does not change the classification when the same test also covers new statements.

## Commands

```bash
npm run test:unit
npm run test:vitest:coverage
```
