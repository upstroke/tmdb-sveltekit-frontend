# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier
- **Project:** TMDB SvelteKit Frontend
- **Module:** Typeahead Search
- **Version:** 1.0
- **Date:** 2026-09-09

### 2. Introduction
The purpose of this test plan is to validate the typeahead search from a user's perspective. The tests verify that users can search movies and TV shows, navigate from a result to the matching details page, use keyboard navigation, and receive appropriate feedback for loading, empty-result, and network-error states.

### 3. Test Items
- `TypeHeadSearch.svelte` — Header search component
- Local search route: `/search?q=<term>&locale=<locale>`
- Result layer: `#typeahead-search-results`
- Status-message layer: `#status-messages-layer`
- Movie detail routes: `/movies/[id]`
- TV-show detail routes: `/tv-shows/[id]`
- Detail-page title: `#details-hero-title`

### 4. Features to be tested
- Search results are displayed after entering at least four characters
- A selected result opens its matching movie or TV-show detail page
- Detail-page title matches the selected result title
- A TV-show result opens a `/tv-shows/[id]` route
- Empty searches display the no-results status message
- A pending request displays the loading status message
- A failed request displays an alert
- Search results are not rendered for loading, empty-result, or error states
- Result links are keyboard reachable with the Tab key
- Escape closes the result list

### 5. Features not to be tested
- Search ranking, relevance, and completeness of TMDB data
- TMDB API availability or response performance
- Visual styling of result cards and status messages
- Screen-reader announcement behaviour beyond the assigned ARIA roles
- Detailed movie and TV-show page content beyond the hero title
- Mobile-specific typeahead layout

### 6. Approach
- **Tool:** Playwright
- **Syntax:** Gherkin for user stories
- **Browser:** Chromium (default)
- **Viewport:** Desktop (1920x1080)
- **Data:** Live search data for functional flows; Playwright route interception for deterministic loading and network-error states
- **Selectors:** Role-based (`getByRole('searchbox')`, `getByRole('status')`, `getByRole('alert')`), CSS ID-based (`#typeahead-search-results`, `#status-messages-layer`, `#details-hero-title`), and result-link selector (`a.result[data-result-link="true"]`)
- **Test Design Techniques:** Equivalence Partitioning, Boundary Value Analysis, State Transition Testing, and Error Guessing (ISTQB Black-Box)
- **Tags:** `@search`, `@typeahead`, `@e2e`, `@black-box`, `@regression`, `@negative`, `@boundary`, `@accessibility`

### 7. Item Pass/Fail Criteria
- **Pass:** Every expected result is fulfilled, relevant elements appear in the correct state, navigation reaches the expected detail route, and no assertion fails.
- **Fail:** At least one action, wait condition, or assertion fails.

---

## State Coverage Matrix

The following matrix covers the mutually exclusive states of the typeahead component after a query with at least four characters: results, loading, no results, and request error.

| Search state | Visible UI | Result list | Test case |
|---|---|---|---|
| Results available | `#typeahead-search-results` | Visible | TC-TS-001, TC-TS-002, TC-TS-005, TC-TS-006 |
| Query shorter than 4 characters | No results or status layer | Not rendered | TC-TS-004 |
| Request pending | `#status-messages-layer` with `role="status"` and `Searching …` | Not rendered | TC-TS-007 |
| No matching results | `#status-messages-layer` with `role="status"` and `No results found.` | Not rendered | TC-TS-003 |
| Request fails | `#status-messages-layer` with `role="alert"` | Not rendered | TC-TS-008 |

### Rationale

- The four-character threshold is covered with boundary-value analysis: three characters represent the invalid boundary and four characters the valid boundary. We only test valid bounderies.
- Status feedback is covered with state-transition testing because loading, success, no-results, and error are separate UI states.
- Network-dependent states use route interception so the tests remain deterministic and do not depend on actual connection speed or API availability.
- Keyboard focus progression is covered because every result link is a native focusable anchor and must be reachable by Tab.

---

## Derived Test Cases

### TC-TS-001: Result opens matching details page

**Feature:** F-TS (Typeahead Search)  
**Module:** Typeahead Search / Movie or TV result  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@search`, `@typeahead`, `@e2e`, `@black-box`, `@regression`

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 1920x1080
- Live search is available

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Clear the search field and enter `Hero` | Search request is triggered after the minimum input length |
| 3 | Wait for `#typeahead-search-results` | Results layer is visible |
| 4 | Store the title of the first result and click its result link | Navigation to a details route begins |
| 5 | Wait for `#details-hero-title` | Details page is visible |
| 6 | Compare titles | Hero title matches the selected result title |

**Pass/Fail Criteria:**
- A result link opens either `/movies/[id]` or `/tv-shows/[id]`.
- The detail-page hero title equals the selected result title.

---

### TC-TS-002: TV-show result opens TV details page

**Feature:** F-TS (Typeahead Search)  
**Module:** Typeahead Search / TV shows  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@search`, `@typeahead`, `@e2e`, `@black-box`, `@regression`

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 1920x1080
- Live search returns a TV-show result for `Breaking Bad`

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Clear the search field and enter `Breaking Bad` | Search request is triggered |
| 3 | Wait for the first result link whose href starts with `/tv-shows/` | A TV-show result is visible |
| 4 | Store its title and click the link | Navigation to TV-show details begins |
| 5 | Verify the URL | URL matches `/tv-shows/[id]` |
| 6 | Verify `#details-hero-title` | Hero title matches the selected TV-show result title |

**Pass/Fail Criteria:**
- A TV-show result is selectable.
- The resulting URL is a TV-show detail route.
- The selected and displayed titles match.

---

### TC-TS-003: No-results status

**Feature:** F-TS (Typeahead Search)  
**Module:** Typeahead Search / Empty state  
**Priority:** Medium  
**Type:** Negative (Black-Box)  
**Tags:** `@search`, `@typeahead`, `@e2e`, `@black-box`, `@negative`, `@regression`

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 1920x1080

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Clear the search field and enter `XYZNOTFOUND123` | Search request is triggered |
| 3 | Wait for `#status-messages-layer` | Status-message layer is visible |
| 4 | Verify the status role and text | `role="status"` contains `No results found.` |
| 5 | Verify `#typeahead-search-results` | Results layer is not rendered |

**Pass/Fail Criteria:**
- The no-results status message is displayed.
- The results layer is absent.

---

### TC-TS-004: Results start at four characters

**Feature:** F-TS (Typeahead Search)  
**Module:** Typeahead Search / Input threshold  
**Priority:** High  
**Type:** Boundary Value (Black-Box)  
**Tags:** `@search`, `@typeahead`, `@e2e`, `@black-box`, `@boundary`, `@regression`

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 1920x1080

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Clear the search field and enter `Her` | Results layer is not rendered or visible |
| 3 | Replace the input with `Hero` | Search request is triggered |
| 4 | Wait for `#typeahead-search-results` | Results layer is visible |

**Pass/Fail Criteria:**
- No result layer is shown at three characters.
- Results can be shown at four characters.

---

### TC-TS-005: Tab moves to next result

**Feature:** F-TS (Typeahead Search)  
**Module:** Typeahead Search / Keyboard navigation  
**Priority:** Medium  
**Type:** Accessibility (Black-Box)  
**Tags:** `@search`, `@typeahead`, `@e2e`, `@accessibility`, `@black-box`, `@regression`

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 1920x1080
- Search term `Hero` returns at least two result links

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Clear the search field and enter `Hero` | Results layer is visible |
| 3 | Press Tab | First result link receives focus |
| 4 | Press Tab again | Second result link receives focus |

**Pass/Fail Criteria:**
- The first and second result links are reachable in sequential keyboard focus order.

---

### TC-TS-006: Escape closes results

**Feature:** F-TS (Typeahead Search)  
**Module:** Typeahead Search / Keyboard interaction  
**Priority:** Medium  
**Type:** Functional (Black-Box)  
**Tags:** `@search`, `@typeahead`, `@e2e`, `@accessibility`, `@black-box`, `@regression`

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 1920x1080
- Search term `Hero` returns results

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Clear the search field and enter `Hero` | Results layer is visible |
| 3 | Press Escape in the search field | Results layer closes |
| 4 | Verify `#typeahead-search-results` | Results layer is hidden or removed |

**Pass/Fail Criteria:**
- Escape closes the currently visible result list.

---

### TC-TS-007: Loading status during pending request

**Feature:** F-TS (Typeahead Search)  
**Module:** Typeahead Search / Loading state  
**Priority:** Medium  
**Type:** State Transition (Black-Box)  
**Tags:** `@search`, `@typeahead`, `@e2e`, `@black-box`, `@regression`

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 1920x1080
- The `/search` request is held through Playwright route interception

| Step | Action | Expected Result |
|---|---|---|
| 1 | Intercept and hold `/search` requests | Request remains pending |
| 2 | Navigate to `/?locale=en-US` | Home page is displayed |
| 3 | Clear the search field and enter `Hero` | Search request is started |
| 4 | Wait for `#status-messages-layer` | Status-message layer is visible |
| 5 | Verify the status role and text | `role="status"` contains `Searching …` |
| 6 | Verify `#typeahead-search-results` | Results layer is not rendered while loading |
| 7 | Release the intercepted request | Request can complete and results may appear |

**Pass/Fail Criteria:**
- The loading status is visible while the request is pending.
- The result layer is absent until results are available.

---

### TC-TS-008: Network-error status

**Feature:** F-TS (Typeahead Search)  
**Module:** Typeahead Search / Error state  
**Priority:** High  
**Type:** Negative / Error Guessing (Black-Box)  
**Tags:** `@search`, `@typeahead`, `@e2e`, `@black-box`, `@negative`, `@regression`

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 1920x1080
- The `/search` request is aborted through Playwright route interception

| Step | Action | Expected Result |
|---|---|---|
| 1 | Intercept `/search` requests and abort them | Search request fails |
| 2 | Navigate to `/?locale=en-US` | Home page is displayed |
| 3 | Clear the search field and enter `Hero` | Search request is started and fails |
| 4 | Wait for `#status-messages-layer` | Status-message layer is visible |
| 5 | Verify the alert role | `role="alert"` is visible |
| 6 | Verify `#typeahead-search-results` | Results layer is not rendered |

**Pass/Fail Criteria:**
- An accessible alert is displayed when the request fails.
- The results layer is absent.
- The error text itself is not asserted because browser-provided network messages can differ.

---

## Gherkin User Stories

### Feature: Typeahead Search (F-TS)

**As** a visitor of the TMDB website  
**I want** to search movies and TV shows from the header  
**So that** I can quickly open the relevant details page

```gherkin
Background:
  Given the app is available in the browser
  And I use the desktop viewport 1920x1080
  And I am on the home page with locale "en-US"

@TC-TS-001
Scenario: A search result opens the matching details page
  When I clear the search field if necessary and enter "Hero"
  And I select the first search result link
  Then I should be on a movie or TV-show details route
  And the details hero title should match the selected result title

@TC-TS-002
Scenario: A TV-show result opens a TV-show details page
  When I clear the search field if necessary and enter "Breaking Bad"
  And I select the first TV-show result link
  Then the URL should match "/tv-shows/[id]"
  And the details hero title should match the selected result title

@TC-TS-003
Scenario: No results are found
  When I clear the search field if necessary and enter "XYZNOTFOUND123"
  Then a status message should contain "No results found."
  And the search results layer should not be rendered

@TC-TS-004
Scenario: Results require at least four characters
  When I clear the search field if necessary and enter "Her"
  Then the search results layer should not be visible
  When I enter "Hero"
  Then the search results layer should be visible

@TC-TS-005
Scenario: Tab moves focus through search results
  When I clear the search field if necessary and enter "Hero"
  And search results are displayed
  When I press Tab
  Then the first result link should have focus
  When I press Tab again
  Then the second result link should have focus

@TC-TS-006
Scenario: Escape closes search results
  When I clear the search field if necessary and enter "Hero"
  And search results are displayed
  When I press Escape
  Then the search results layer should be hidden

@TC-TS-007
Scenario: A loading status is shown while the request is pending
  Given the search request is delayed
  When I clear the search field if necessary and enter "Hero"
  Then a status message should contain "Searching …"
  And the search results layer should not be rendered

@TC-TS-008
Scenario: An error alert is shown when the request fails
  Given the search request fails
  When I clear the search field if necessary and enter "Hero"
  Then an alert should be visible
  And the search results layer should not be rendered
```

---

## Run Tests

```bash
# All acceptance tests
just test-acceptance

# Only typeahead-search tests
npx playwright test tests/acceptance/typeheadsearch/typeahead-search.spec.js

# Typeahead-search tests by tag
npx playwright test -g @search
npx playwright test -g @typeahead
npx playwright test -g @regression
npx playwright test -g @negative
npx playwright test -g @boundary
npx playwright test -g @accessibility

# Combined filters
npx playwright test -g "(?=.*@search)(?=.*@negative)"
npx playwright test -g "(?=.*@search)(?=.*@accessibility)"

# With UI mode
npx playwright test tests/acceptance/typeheadsearch/typeahead-search.spec.js --ui

# Headed mode
npx playwright test tests/acceptance/typeheadsearch/typeahead-search.spec.js --headed
```

---

## Notes

- **Test File:** `tests/acceptance/typeheadsearch/typeahead-search.spec.js`
- **Test Cases:** TC-TS-001 through TC-TS-008
- **Dependencies:** Live development server; live search data for result-navigation flows
- **Controlled requests:** TC-TS-007 delays the local search route and TC-TS-008 aborts it through Playwright routing
- **Viewport:** Desktop (1920x1080)
- **Result layer:** Rendered only when movie or TV-show results exist
- **Status layer:** Rendered for pending, no-results, and failed-search states

---

## Traceability Matrix

| Test Case | Feature | Module | Type | Priority | Tags |
|---|---|---|---|---|---|
| TC-TS-001 | F-TS | Result navigation | Functional (Black-Box) | High | `@search`, `@typeahead`, `@e2e`, `@black-box`, `@regression` |
| TC-TS-002 | F-TS | TV-show navigation | Functional (Black-Box) | High | `@search`, `@typeahead`, `@e2e`, `@black-box`, `@regression` |
| TC-TS-003 | F-TS | Empty state | Negative (Black-Box) | Medium | `@search`, `@typeahead`, `@e2e`, `@black-box`, `@negative`, `@regression` |
| TC-TS-004 | F-TS | Input threshold | Boundary Value (Black-Box) | High | `@search`, `@typeahead`, `@e2e`, `@black-box`, `@boundary`, `@regression` |
| TC-TS-005 | F-TS | Keyboard focus | Accessibility (Black-Box) | Medium | `@search`, `@typeahead`, `@e2e`, `@accessibility`, `@black-box`, `@regression` |
| TC-TS-006 | F-TS | Keyboard close | Functional (Black-Box) | Medium | `@search`, `@typeahead`, `@e2e`, `@accessibility`, `@black-box`, `@regression` |
| TC-TS-007 | F-TS | Loading state | State Transition (Black-Box) | Medium | `@search`, `@typeahead`, `@e2e`, `@black-box`, `@regression` |
| TC-TS-008 | F-TS | Network error | Negative / Error Guessing (Black-Box) | High | `@search`, `@typeahead`, `@e2e`, `@black-box`, `@negative`, `@regression` |
