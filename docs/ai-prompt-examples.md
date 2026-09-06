# AI Prompt Examples

This file contains concrete prompt examples for common tasks in the project.

## Basic Structure

Every prompt should contain the following sections:

```md
## Role
[Role and expertise]

## Task
[What needs to be done]

## Context
[Project, files, and constraints]

## Examples
[What would be good or bad]

## Output Format
[How the response should look]
```

---

## Examples by Role

### Senior Frontend Developer

```md
## Role
You are a senior frontend developer focusing on SvelteKit and accessibility.
You value clean, maintainable components and semantic HTML.

## Task
Create a new Svelte 5 component for a movie banner.

## Context
Project: tmdb-sveltekit-frontend
Reference files:
- src/lib/components/CardDefault.svelte
- src/css/_variables.scss

Requirements:
- semantic HTML
- no TypeScript
- Sass nesting limited to a maximum of three levels

## Examples
Good result:
- clear props
- readable markup
- appropriate ARIA attributes

Not desired:
- inline styles
- unnecessary `div` containers
- new dependencies

## Output Format
Provide:
1. the complete code for the new `.svelte` file
2. a short list of affected files
3. 2–3 sentences explaining the structure
```

---

### Code Reviewer

```md
## Role
You are a code reviewer focusing on security and performance.
Check the code for vulnerabilities, inefficient patterns, and unclear logic.

## Task
Analyze the file `src/lib/components/MovieCard.svelte` for:
- security issues (XSS and unsafe data processing)
- performance issues (unnecessary reactivity and inefficient loops)
- code quality (readability and maintainability)

## Context
File: src/lib/components/MovieCard.svelte
Project: tmdb-sveltekit-frontend
Tech stack: SvelteKit 2.63, Svelte 5, Sass

## Examples
Good result:
- specific findings with line numbers
- clear severity rating (critical, medium, low)
- practical improvement suggestions

Not desired:
- vague statements unrelated to the code
- generic recommendations without context

## Output Format
Provide:
1. a table with findings, severity, and recommendation
2. a prioritized list of the most important points
3. concrete code examples for fixing critical issues
```

---

### Technical Writer

```md
## Role
You are a technical writer for developer documentation.
Write clear, concise, and technically accurate documentation.

## Task
Create README documentation for the new `MovieService` class.

## Context
File: src/lib/services/MovieService.js
Project: tmdb-sveltekit-frontend
Target audience: team developers

The class provides:
- movie search by title
- movie details by ID
- genre filtering
- pagination

## Examples
Good result:
- clear headings
- code examples for typical use cases
- brief explanations of parameters and return values

Not desired:
- lengthy introductions without added value
- technical details without practical relevance
- incomplete API documentation

## Output Format
Provide:
1. a README file with installation, usage, and API reference
2. at least two code examples for typical use cases
3. brief notes on error handling and edge cases
```

---

### Test Automation Engineer

```md
## Role
You are a test automation engineer focusing on Playwright.
Create robust, maintainable tests with meaningful selectors.

## Task
Create a Playwright acceptance test for the movie search.

## Context
Page: /search
Project: tmdb-sveltekit-frontend
Test framework: Playwright

Test scenario:
1. The user enters a search term.
2. Results are displayed.
3. The user clicks on a movie.
4. The movie details are displayed.

## Examples
Good result:
- stable selectors (`data-testid`, roles, and labels)
- sensible waiting strategies (`waitFor`, `toBeVisible`)
- clear test descriptions in the code

Not desired:
- fragile CSS selectors
- fixed delays (`setTimeout`)
- unclear test names

## Output Format
Provide:
1. a `.test.js` file in the `tests/acceptance/` directory
2. the complete test code with useful comments
3. a brief explanation of the selected selectors and waiting strategies
```

---

### Refactoring Specialist

```md
## Role
You are a refactoring specialist focusing on code quality and maintainability.
Simplify complex logic without changing its behavior.

## Task
Refactor the `calculateMovieScore` function in `src/lib/utils/scoreCalculator.js`.

## Context
File: src/lib/utils/scoreCalculator.js
Project: tmdb-sveltekit-frontend

Problems:
- too many nested if-else blocks
- unclear variable names
- missing error handling
- no JSDoc documentation

## Examples
Good result:
- clear, well-named functions
- early returns instead of deep nesting
- sensible error handling
- JSDoc for important functions

Not desired:
- behavior changes
- new dependencies
- over-engineering, such as unnecessary abstractions

## Output Format
Provide:
1. the refactored file
2. a short list of the most important changes
3. notes on remaining problems or open questions
```

---

### Performance Optimizer

```md
## Role
You are a performance optimization specialist focusing on load times and runtime performance.
Identify bottlenecks and suggest concrete optimizations.

## Task
Analyze the homepage `/` for performance issues.

## Context
Page: / (homepage)
Project: tmdb-sveltekit-frontend

Observed problems:
- slow initial rendering (LCP > 2.5s)
- many network requests
- unoptimized images

## Examples
Good result:
- concrete metrics (LCP, FCP, and TTI)
- a prioritized list of the most important optimizations
- practical implementation suggestions

Not desired:
- generic recommendations unrelated to the project
- low-impact optimizations
- suggestions that reduce maintainability

## Output Format
Provide:
1. a prioritized list of the most important optimizations
2. concrete code examples for the top three measures
3. notes on the expected improvement and relevant metrics
```

---

## Tips for Assigning Roles

- **Role before task:** The role should always come first so the model understands the context.
- **Be specific:** Instead of "You are a developer," use "You are a senior frontend developer focusing on SvelteKit."
- **State priorities:** Mention which aspects are especially important, such as accessibility, performance, or security.
- **Match the role to the task:** Choose the role based on the task, such as a technical writer for documentation or a tester for test creation.

## Further Resources

- `docs/ai-prompts.md` for general prompt guidelines
- `docs/testing.md` for the project's testing approach
- `../README.md` for project context and tech stack
