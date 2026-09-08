# AI Prompts for Development

This file documents proven prompt patterns for AI-assisted development in the project.

## Core Principles

- **Clear structure:** Use sections with headings such as `## Role`, `## Task`, `## Context`, `## Examples`, and `## Output Format`.
- **Start with the goal:** Define one clear task and its success criteria.
- **Provide context early:** Mention the tech stack, relevant files, existing patterns, and functional constraints at the beginning.
- **Use examples:** Two or three examples of the desired output are often more helpful than lengthy explanations.
- **Work iteratively and minimally:** Start with a concise, clear request and add only what is genuinely missing for a better result.

See `docs/ai-prompt-examples.md` for concrete prompt examples by role.

## Project Context

This project uses:

- SvelteKit 2.63 with Svelte 5
- Vite as the build tool
- Sass/SCSS for styles
- PostCSS with Autoprefixer
- Fomantic UI / Semantic UI classes
- Playwright for acceptance tests
- Vitest for component, integration, and unit tests

Important project paths:

- `src/routes` for routes
- `src/lib/components` for UI components
- `src/lib` for shared logic
- `src/css` for global styles

## Browser Targets

- the last two browser versions
- market share above 0.5%
- no obsolete browsers

## Locally Available CLI Tools

- `rg` (ripgrep) for fast text searches
- `fd` for fast file and directory searches
- `fzf` for interactive selection and filtering
- `bat` for readable file output
- `delta` for readable Git diffs
- `sd` for simple, targeted text changes

## Session Start Prompt

This prompt is a recommended starting template for new AI sessions in this project.

### Rule Priority and Document Scope

Apply instructions in the following order:

1. Explicit instructions in the current task.
2. Project-specific rules in this document and the applicable test-level documentation.
3. Existing code patterns, architecture, and repository conventions.
4. General framework and software-engineering best practices.

For test tasks, apply the relevant documentation in this order:

1. `docs/testing.md`
2. `docs/testing/common-rules.md`
3. The relevant guide in `docs/testing/`
4. For Playwright end-to-end acceptance tests: `playwright.config.js`, the affected feature directory's `*-testplan.md`, and its existing `*.spec.js` files

A task-specific test document applies only within its documented scope. For Playwright end-to-end acceptance tests, the feature-local `*-testplan.md` is the source of truth for test scope, feature IDs, test case IDs, priorities, tags, traceability, and expected user-visible behavior.

If instructions at the same priority level conflict, stop and explain the conflict before making changes. Never silently override a higher-priority instruction with a lower-priority preference.

First, read README.md, package.json, justfile, and, for testing tasks, also playwright.config.js.

Important working rules:
- Before making changes, briefly align on the goal, affected files, and proposed approach.
- Implement changes only in small, understandable steps.
- If there are concerns, alternatives, or unclear assumptions, explain them briefly first instead of changing the code immediately.
- Suggest standardizations, but do not implement them without prior approval.
- The directory structure exists for a reason and must not be reorganized without prior approval.
- Do not modify files outside the explicitly approved scope. If additional files appear necessary, stop and ask for approval.
- Do not commit, push, create branches, or open pull requests unless explicitly requested.
- Never include, expose, or commit secrets, API keys, passwords, tokens, or values from environment files.

Execution notes:
- If the specified CLI tools are not installed locally, check whether they should be installed and ask for approval at the beginning of the session.
- If the tools are installed locally, they may be used.
- If other locally installable tools would significantly speed up the work, proactively mention them and briefly explain why.
- If a task is likely to require more steps than can reasonably be completed in one pass, say so early and split it into smaller packages.

Error and retry handling:
- If a tool call is interrupted or fails, state this clearly at once, including the suspected cause, impact, and next sensible step.
- After an interrupted tool call, do not make silent assumptions. Either restart cleanly or ask for clarification.
- Flaky commands may be retried deliberately, but not indefinitely: first perform a short retry, then assess the situation, and if it fails again, narrow down the cause instead of continuing blindly.
- Before targeted file edits, read the current file state exactly and copy search text character-for-character from the file.
- If an edit fails because of an exact match, reread the file and choose the smallest safe change.
- If something goes wrong or is not completed, say so openly so work can resume at exactly that point.

Code creation and modification strategy:
- Prefer existing patterns, conventions, and architecture.
- Apply SvelteKit and Svelte best practices, including proper error handling and appropriate use of existing hook structures.
- JavaScript should remain readable, transparent, and easy for people to understand.
- Do not use TypeScript unless explicitly agreed otherwise.
- Work with what is already available in the project and locally; use existing browser APIs first and do not introduce or install additional libraries or tools without approval.
- Suggestions for useful additional libraries or tools are welcome, but their use or installation requires prior approval.
- If `switch`/`case` makes the logic clearer and more transparent, prefer that structure.
- Document newly created or substantially changed functions with JSDoc.
- Treat the JSDoc belonging to a method or function as one unit.
- For documentation tasks, only add documentation and do not refactor logic at the same time.
- Use JSDoc with judgment: document important or non-obvious functions, but do not artificially inflate trivial files.
- Prefer semantic HTML, avoid unnecessary `div` elements, and consider screen readers, keyboard navigation, and meaningful ARIA attributes.
- Keep Sass/CSS readable and limit nesting to a maximum of three levels.
- Leave imports of other CSS or Sass libraries untouched initially, as they are usually managed centrally through imports.
- After each meaningful step, briefly state the result and the next option.
- Then review changes deliberately and run appropriate tests.

General:
- Work concisely, in a structured and project-specific way.
- Keep responses brief by default.
- Whenever possible, describe tasks briefly using the goal, affected files, and desired mode, such as analyze, suggest, implement, or verify.

## Standard Prompts

### Create a New Component

```text
Create a new Svelte 5 component following the style of `src/lib/components/CardDefault.svelte`.

Goal: [brief description of the component]

Requirements:
- Use our design variables from `src/css/_variables.scss`.
- Pay attention to ARIA labels and semantic HTML.
- Do not use external libraries; use existing patterns only.

Output: A `.svelte` file in the `src/lib/components` directory.
```

### Write a Test

```text
Create a test for [function/component/feature].

Context:
- The test subject is located in `src/lib/...` or `src/routes/...`.
- Read `docs/testing.md`, `docs/testing/common-rules.md`, and the applicable test-level guide before proposing changes.
- Existing tests are in `tests/unit/`, `tests/integration/`, or `tests/acceptance/`.

Requirements:
- Select the appropriate test level before implementation.
- Preserve existing patterns and conventions.
- Reuse fixtures, mocks, and setup utilities where applicable.
- For Playwright end-to-end acceptance tests, also read `playwright.config.js` and the affected feature directory's test plan and existing specifications.

Output: A test file in the appropriate existing test directory.
```

### CSS Change

```text
Change the CSS in `src/css/app.scss` to achieve [goal].

Requirements:
- Use our Sass variables and mixins.
- Observe browser compatibility according to the project configuration.
- Limit nesting to a maximum of three levels.

Output: The modified SCSS file.
```

### Refactoring

```text
Refactor [function/component] for improved readability.

Goal:
- [specific goal, e.g. “less nesting” or “better error handling”]

Requirements:
- Preserve existing patterns and conventions.
- Do not introduce new libraries.
- Add JSDoc for important or non-obvious functions.

Output: The refactored file.
```

### Internationalization (i18n)

```text
Add new UI text to `src/lib/i18n/ui.json`.

Requirements:
- Always update all supported locales (de-DE, en-US, es-ES, fr-FR, vi-VN).
- Use concise, precise wording.
- Do not use hardcoded strings in the code; always use i18n keys.
- If the translation is uncertain, ask a brief clarification question.

Output: The modified `ui.json` with entries for all locales.
```

## Dos and Don'ts

### Dos

- Formulate clear, specific tasks.
- Mention the tech stack and context early.
- Provide examples of the desired output.
- Work iteratively and verify intermediate results.
- Review AI-generated code like external code.

### Don'ts

- Do not include secrets or API keys in prompts.
- Do not formulate vague tasks such as “make it better.”
- Do not write long, unstructured prompts without a goal and context.
- Do not make assumptions about files or project parts that were not mentioned.

## Security Notes

- **No secrets:** Never use API keys, passwords, or other sensitive data in prompts.
- **Review required:** Every piece of AI-generated code must be reviewed before merging.
- **CI scans:** Automatic SAST and secret scans are useful for AI-influenced changes.

## Further Information

- `docs/testing.md` for the project's testing overview
- `docs/testing/common-rules.md` for rules shared by all automated tests
- `docs/testing/unit-tests.md` for Vitest unit-test rules
- `docs/testing/integration-tests.md` for Vitest integration-test rules
- `docs/testing/playwright-acceptance-tests.md` for Playwright end-to-end acceptance-test rules
- `../README.md` for project context and tech stack
- `docs/ai-prompt-examples.md` for concrete prompt examples by role
