# Accessibility Test Plan – Typeahead Search

## 1. Test Plan Identifier

- **Project:** TMDB SvelteKit Frontend
- **Module:** Typeahead Search
- **Test Type:** Accessibility / Keyboard Interaction
- **Version:** 1.1
- **Date:** 2026-09-14
- **Test File:** `tests/acceptance/typeheadsearch/typeahead-search.a11y.spec.js`

## 2. Introduction

This test plan validates the accessibility behaviour of the header typeahead search. It focuses on semantic roles, ARIA relationships, keyboard operation, focus management, and accessible status feedback.

The tests complement the functional acceptance tests. Functional flows such as search-result navigation, the input-length boundary, click-outside behaviour, loading, and error handling are maintained in the regular typeahead acceptance test suite.

## 3. Test Items

- `TypeHeadSearch.svelte` — Header search component
- Search input: `#typeahead-search-input`
- Search hint: `#typeahead-search-hint`
- Results layer: `#typeahead-search-results`
- Status-message layer: `#status-messages-layer`
- Status message: `#status-messages`
- Result links: `a.result[data-result-link="true"]`
- Movie result IDs: `movie-<id>`
- TV-show result IDs: `tv-<id>`

## 4. Accessibility Requirements

### Search input

- The search field exposes `role="combobox"`.
- The input uses `aria-autocomplete="list"`.
- The input exposes the result popup using `aria-haspopup="listbox"`.
- The input references the result layer through `aria-controls="typeahead-search-results"`.
- The input references the instructional hint through `aria-describedby="typeahead-search-hint"`.
- `aria-expanded` reflects whether search results are visible.
- `aria-activedescendant` identifies the currently selected result while keyboard navigation is active.

### Results

- The result container exposes `role="listbox"`.
- The result container has an accessible label.
- Individual result links expose `role="option"`.
- The component automatically selects the first available result when results are received.
- The auto-selected first option uses `aria-selected="true"` and `tabindex="0"`.
- Other, non-selected result options use `aria-selected="false"` and `tabindex="-1"`.
- Each option has an accessible name via `aria-labelledby`.

### Keyboard operation

- `ArrowDown` selects the next result.
- `ArrowUp` selects the previous result.
- `Home` selects the first result.
- `End` selects the last result.
- `Enter` activates the selected result.
- `Escape` closes results and restores focus to the search field.
- Tab navigation follows the component's roving-tabindex behaviour.

### Status feedback

- Loading and no-results feedback use `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`.
- Search errors use `role="alert"` and `aria-live="assertive"`.
- The status layer is associated with the visible feedback state.

## 5. Features to be Tested

1. Combobox semantics and ARIA attributes on the search input.
2. Listbox semantics and accessible label on the result container.
3. Option semantics, automatic initial selection, tab index, and labels on search results.
4. Keyboard navigation with ArrowDown and ArrowUp.
5. Keyboard navigation with Home and End.
6. Result activation through Enter.
7. Closing the popup and restoring focus through Escape.
8. Roving-tabindex / Tab reachability of result options.
9. Synchronization of `aria-activedescendant` with the selected option.
10. Search-hint association through `aria-describedby`.
11. Accessible no-results and loading status feedback.
12. Accessible error feedback.

## 6. Features Not to be Tested

- Search ranking, relevance, or completeness of TMDB data.
- TMDB API availability, latency, or response performance.
- Visual focus-ring styling, colours, contrast ratios, or layout.
- Screen-reader announcement timing or speech output in a particular assistive technology.
- Mobile-specific layout and touch interaction.
- Detailed content of movie and TV-show pages beyond navigation being initiated.
- Click-outside behaviour and other general functional flows, which belong to the functional acceptance suite.

## 7. Test Approach

- **Tool:** Playwright
- **Browser:** Chromium (default)
- **Viewport:** Desktop, 1920x1080
- **Locale:** `en-US`
- **Data:** Live search data for result-based flows; Playwright route interception for the error-state test.
- **Selectors:** CSS IDs for stable component landmarks, role-based locators for ARIA semantics, and result link selectors where needed.
- **Techniques:** Keyboard interaction testing, state-transition testing, equivalence partitioning, and accessibility-oriented black-box testing.
- **Tags:** `@search`, `@typeahead`, `@a11y`, `@accessibility`, `@e2e`, `@black-box`, `@regression`

## 8. Entry and Exit Criteria

### Entry Criteria

- The application is running on `localhost:4173`.
- The TypeHeadSearch component is present in the header.
- The English locale can be loaded at `/?locale=en-US`.
- Live search is available for result-navigation cases.

### Exit Criteria

- All applicable test cases pass in Chromium.
- No assertion fails for required roles, ARIA relationships, keyboard behaviour, or focus management.
- Known live-data dependencies are documented when a test cannot be repeated deterministically.

## 9. Pass/Fail Criteria

- **Pass:** Each expected accessible role, attribute, focus state, navigation result, and feedback state is observed.
- **Fail:** A required element is missing; an attribute has a wrong value; focus does not move as expected; a key action does not produce its required effect; or an assertion fails.

## 10. Derived Test Cases

### TC-TS-A11Y-001: Combobox attributes

- **Feature:** F-TS (Typeahead Search)
- **Module:** Search input semantics
- **Priority:** High
- **Type:** Accessibility / Structural

**Preconditions:**

- App running on `localhost:4173`
- Chromium at desktop viewport
- Home page loaded at `/?locale=en-US`

| Step | Action | Expected result |
|---|---|---|
| 1 | Locate `#typeahead-search-input` | Input is present |
| 2 | Inspect the input role | `role="combobox"` is present |
| 3 | Inspect autocomplete and popup attributes | `aria-autocomplete="list"` and `aria-haspopup="listbox"` are present |
| 4 | Inspect references | `aria-controls="typeahead-search-results"` and `aria-describedby="typeahead-search-hint"` are present |
| 5 | Inspect initial popup state | `aria-expanded="false"` is present before results are shown |

### TC-TS-A11Y-002: Result list semantics

- **Feature:** F-TS (Typeahead Search)
- **Module:** Results layer semantics
- **Priority:** High
- **Type:** Accessibility / Structural

| Step | Action | Expected result |
|---|---|---|
| 1 | Enter a search query with results | Results layer becomes visible |
| 2 | Locate `#typeahead-search-results` | Results layer is present |
| 3 | Inspect semantic attributes | `role="listbox"` is present |
| 4 | Inspect accessible metadata | Accessible label and `aria-live="polite"` are present |

### TC-TS-A11Y-003: Result option semantics and initial selection

- **Feature:** F-TS (Typeahead Search)
- **Module:** Result items
- **Priority:** High
- **Type:** Accessibility / Structural

**Preconditions:**

- App running on `localhost:4173`
- Chromium at desktop viewport
- Home page loaded at `/?locale=en-US`
- A search term returns at least one result

| Step | Action | Expected result |
|---|---|---|
| 1 | Enter a search query that returns results | Result list becomes visible |
| 2 | Locate the first result option | It is present and visible |
| 3 | Inspect semantic attributes | It has `role="option"` |
| 4 | Inspect first-option state | It has `aria-selected="true"` and `tabindex="0"`, because the component automatically selects the first result |
| 5 | Inspect accessible naming | `aria-labelledby` references the result type and content |
| 6 | If a second result exists, inspect its state | It has `aria-selected="false"` and `tabindex="-1"` |

**Pass/Fail Criteria:**

- The first result is automatically selected when results are rendered.
- The first result exposes `aria-selected="true"` and `tabindex="0"`.
- Each inspected option exposes `role="option"` and an `aria-labelledby` reference.
- Any inspected non-selected result exposes `aria-selected="false"` and `tabindex="-1"`.

**Rationale:**

The component automatically selects the first available result after successful search results are received. Therefore, the first option must already be selected and be the active item in the roving-tabindex pattern; subsequent options remain unselected until navigation changes the selection.

### TC-TS-A11Y-004: ArrowDown selects the next result

- **Feature:** F-TS (Typeahead Search)
- **Module:** Keyboard navigation
- **Priority:** High
- **Type:** Accessibility / Keyboard interaction

| Step | Action | Expected result |
|---|---|---|
| 1 | Display search results | The first result is automatically selected |
| 2 | Press ArrowDown | The next result becomes selected when available |
| 3 | Inspect selected result | It has `aria-selected="true"` and `tabindex="0"` |
| 4 | Inspect previous result | It becomes unselected with `aria-selected="false"` and `tabindex="-1"` |

### TC-TS-A11Y-005: ArrowUp selects the previous result

- **Feature:** F-TS (Typeahead Search)
- **Module:** Keyboard navigation
- **Priority:** Medium
- **Type:** Accessibility / Keyboard interaction

| Step | Action | Expected result |
|---|---|---|
| 1 | Display results and select the second result with ArrowDown | Second result is selected when available |
| 2 | Press ArrowUp | First result becomes selected |
| 3 | Inspect first result | It has `aria-selected="true"` |

### TC-TS-A11Y-006: Home selects the first result

- **Feature:** F-TS (Typeahead Search)
- **Module:** Keyboard navigation
- **Priority:** Medium
- **Type:** Accessibility / Keyboard interaction

| Step | Action | Expected result |
|---|---|---|
| 1 | Display multiple results | Result list is visible; first result is initially selected |
| 2 | Select a later result | A result after the first is selected where available |
| 3 | Press Home | First result becomes selected |
| 4 | Inspect first result | `aria-selected="true"` is present |

### TC-TS-A11Y-007: End selects the last result

- **Feature:** F-TS (Typeahead Search)
- **Module:** Keyboard navigation
- **Priority:** Medium
- **Type:** Accessibility / Keyboard interaction

| Step | Action | Expected result |
|---|---|---|
| 1 | Display multiple results | At least two result options are visible; first result is initially selected |
| 2 | Press End | Last result becomes selected |
| 3 | Inspect last result | `aria-selected="true"` is present |

### TC-TS-A11Y-008: Enter activates selected result

- **Feature:** F-TS (Typeahead Search)
- **Module:** Keyboard navigation
- **Priority:** High
- **Type:** Accessibility / Keyboard interaction

| Step | Action | Expected result |
|---|---|---|
| 1 | Display results | First result is automatically selected |
| 2 | Record the selected result href | A valid details-route href is available |
| 3 | Press Enter | Navigation to the selected result begins |
| 4 | Verify location | Browser URL matches the selected result href |

### TC-TS-A11Y-009: Escape closes results

- **Feature:** F-TS (Typeahead Search)
- **Module:** Keyboard navigation
- **Priority:** High
- **Type:** Accessibility / Keyboard interaction

| Step | Action | Expected result |
|---|---|---|
| 1 | Display results | Result list is visible and first result is automatically selected |
| 2 | Press Escape | Results layer is hidden or removed |
| 3 | Verify focus | Focus returns to `#typeahead-search-input` |

### TC-TS-A11Y-010: Status feedback semantics

- **Feature:** F-TS (Typeahead Search)
- **Module:** Status feedback
- **Priority:** High
- **Type:** Accessibility / State transition

| Step | Action | Expected result |
|---|---|---|
| 1 | Enter a query that produces no results | Status layer becomes visible |
| 2 | Locate `#status-messages` | Status message is present |
| 3 | Inspect role | `role="status"` is present |
| 4 | Inspect live-region attributes | `aria-live="polite"` and `aria-atomic="true"` are present |

### TC-TS-A11Y-011: Error feedback semantics

- **Feature:** F-TS (Typeahead Search)
- **Module:** Error feedback
- **Priority:** High
- **Type:** Accessibility / Error state

| Step | Action | Expected result |
|---|---|---|
| 1 | Intercept and fail the `/search` request | Search request fails |
| 2 | Enter a query with at least four characters | Error status appears |
| 3 | Locate `#status-messages` | Error message is present |
| 4 | Inspect role and live region | `role="alert"` and `aria-live="assertive"` are present |

### TC-TS-A11Y-012: Search hint relationship

- **Feature:** F-TS (Typeahead Search)
- **Module:** Input instructions
- **Priority:** Medium
- **Type:** Accessibility / Structural

| Step | Action | Expected result |
|---|---|---|
| 1 | Read `aria-describedby` from the search input | It references `typeahead-search-hint` |
| 2 | Locate the referenced element | Hint element exists |
| 3 | Inspect hint text | It communicates the four-character minimum requirement |

### TC-TS-A11Y-013: Sequential tab reachability

- **Feature:** F-TS (Typeahead Search)
- **Module:** Keyboard focus
- **Priority:** Medium
- **Type:** Accessibility / Keyboard interaction

| Step | Action | Expected result |
|---|---|---|
| 1 | Display search results | The first result is automatically selected and is the current `tabindex="0"` option |
| 2 | Press Tab | Focus advances according to the component's roving-tabindex implementation |
| 3 | Verify the current focus target | The focused result or subsequent page control follows the actual sequential tab order |

### TC-TS-A11Y-014: Active descendant synchronization

- **Feature:** F-TS (Typeahead Search)
- **Module:** Combobox state
- **Priority:** High
- **Type:** Accessibility / Dynamic ARIA state

| Step | Action | Expected result |
|---|---|---|
| 1 | Display search results | First result is automatically selected |
| 2 | Read `aria-activedescendant` | It equals the first selected result option's `id` |
| 3 | Press ArrowDown | Next result becomes selected when available |
| 4 | Read `aria-activedescendant` | It equals the newly selected result option's `id` |

## 11. State Coverage Matrix

| State | Required accessible output | Covered by |
|---|---|---|
| Initial | Combobox is collapsed; hint relationship exists | TC-TS-A11Y-001, TC-TS-A11Y-012 |
| Results visible | Listbox and options expose roles and relationships | TC-TS-A11Y-002, TC-TS-A11Y-003 |
| Results initially loaded | First option is automatically selected and receives `tabindex="0"` | TC-TS-A11Y-003 |
| Result selected | Option has selected state and input tracks active descendant | TC-TS-A11Y-004 to TC-TS-A11Y-007, TC-TS-A11Y-014 |
| Result activated | Enter starts navigation to selected option | TC-TS-A11Y-008 |
| Results closed | Escape closes popup and restores input focus | TC-TS-A11Y-009 |
| No results | Polite status live region is used | TC-TS-A11Y-010 |
| Search error | Assertive alert live region is used | TC-TS-A11Y-011 |
| Sequential focus | Tab follows roving-tabindex semantics | TC-TS-A11Y-013 |

## 12. Gherkin User Stories

Feature: Accessible Typeahead Search
  As a keyboard and assistive-technology user
  I want the header search to expose correct semantics and keyboard behaviour
  So that I can discover, select, and open search results accessibly

  Background:
    Given the application is available in the browser
    And I use the desktop viewport 1920x1080
    And I am on the home page with locale "en-US"

  @TC-TS-A11Y-001
  Scenario: The search field exposes combobox semantics
    Then the search field should have role "combobox"
    And it should describe the result list and search hint
    And it should initially be collapsed

  @TC-TS-A11Y-003
  Scenario: The first search result is initially selected
    Given a search returns results
    Then the first result should have role "option"
    And the first result should have aria-selected "true"
    And the first result should have tabindex "0"
    And any later result should be unselected

  @TC-TS-A11Y-004
  Scenario: ArrowDown selects the next result
    Given search results are displayed
    And the first result is automatically selected
    When I press ArrowDown in the search field
    Then the next result should be selected when available

  @TC-TS-A11Y-008
  Scenario: Enter activates the selected result
    Given search results are displayed
    And the first result is selected
    When I press Enter
    Then I should navigate to the selected result route

  @TC-TS-A11Y-009
  Scenario: Escape closes the results popup
    Given search results are displayed
    When I press Escape
    Then the results popup should be closed
    And focus should return to the search field

  @TC-TS-A11Y-010
  Scenario: Empty search feedback is a polite status
    When a search produces no results
    Then the status message should use role "status"
    And it should use an aria-live value of "polite"

  @TC-TS-A11Y-011
  Scenario: Failed search feedback is an alert
    Given the search request fails
    When I enter a valid search term
    Then the error message should use role "alert"
    And it should use an aria-live value of "assertive"


## 13. Run Tests

```bash
# Only Typeahead Search accessibility tests
npx playwright test tests/acceptance/typeheadsearch/typeahead-search.a11y.spec.js

# UI mode
npx playwright test tests/acceptance/typeheadsearch/typeahead-search.a11y.spec.js --ui

# Headed mode
npx playwright test tests/acceptance/typeheadsearch/typeahead-search.a11y.spec.js --headed

# Run matching tests by title/tag convention
npx playwright test -g "A11Y"
```

## 14. Traceability Matrix

| Test case | Requirement area | Type | Priority |
|---|---|---|---|
| TC-TS-A11Y-001 | Combobox roles and relationships | Structural | High |
| TC-TS-A11Y-002 | Listbox semantics | Structural | High |
| TC-TS-A11Y-003 | Option semantics and automatic initial selection | Structural | High |
| TC-TS-A11Y-004 | ArrowDown navigation | Keyboard | High |
| TC-TS-A11Y-005 | ArrowUp navigation | Keyboard | Medium |
| TC-TS-A11Y-006 | Home navigation | Keyboard | Medium |
| TC-TS-A11Y-007 | End navigation | Keyboard | Medium |
| TC-TS-A11Y-008 | Enter activation | Keyboard | High |
| TC-TS-A11Y-009 | Escape close and focus restoration | Keyboard | High |
| TC-TS-A11Y-010 | Status live-region semantics | State transition | High |
| TC-TS-A11Y-011 | Error alert semantics | Error state | High |
| TC-TS-A11Y-012 | Search hint association | Structural | Medium |
| TC-TS-A11Y-013 | Sequential Tab reachability | Keyboard | Medium |
| TC-TS-A11Y-014 | aria-activedescendant synchronization | Dynamic ARIA state | High |
