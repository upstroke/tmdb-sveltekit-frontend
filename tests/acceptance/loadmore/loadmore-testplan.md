# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier
- **Project:** TMDB SvelteKit Frontend
- **Module:** Load More (Trending Cards)
- **Version:** 1.3
- **Date:** 2026-09-09

### 2. Introduction
This test plan validates the Load More functionality for media-card lists from a user's perspective. It verifies that additional content loads correctly, loading feedback is exposed, errors are handled, and the visible button is disabled after an empty response indicates that no more results are available.

### 3. Test Items
- Trending cards section on the Home page
- Card lists on Movies and TV Shows pages
- "More results" button, located by `getByRole('button', { name: 'More results' })`
- API endpoints: `/trending`, `/movies`, `/tv-shows`
- Button states: `disabled`, `aria-busy`, and the `loading` CSS class
- Card selector: `ul.media-card-list > li`

### 4. Features to be tested
- Loading additional cards after clicking the Load More button
- Loading-state feedback: disabled button, `aria-busy="true"`, and `loading` CSS class
- Returning to the normal state after a successful request when results remain available
- Returning to the normal state after an error when results remain available
- Handling an empty response without adding cards
- Keeping the button visible but disabled when no additional results are available
- Removing the `loading` CSS class and setting `aria-busy="false"` after loading completes

### 5. Features not to be tested
- API implementation and response mapping on the server
- Pagination calculations and page numbers in isolation
- Rendering details inside an individual media card
- Visual styling across all browsers
- Performance, offline mode, and high-load behavior

### 6. Approach
- **Tool:** Playwright
- **Test level:** Acceptance / end-to-end
- **Technique:** Black-box testing with decision-table coverage
- **Browser:** Chromium
- **Viewport:** Desktop default viewport
- **Selectors:** Accessible role-based selectors for the button and CSS selectors for card counts
- **Network mocking:** `page.route()` is used for delayed, HTTP 500, and empty-result responses
- **Tags:** `@loadmore`, page tags (`@home`, `@movies`, `@tvshows`), `@black-box`, `@regression`

### 7. Item Pass/Fail Criteria
- **Pass:** Every action and assertion succeeds; the expected card count and button state are reached; no unexpected browser errors occur.
- **Fail:** At least one action or assertion fails.

---

## Decision Table

| Test Variant / Feature | Home (`/`) | Movies (`/movies`) | TV Shows (`/tv-shows`) |
|------------------------|------------|-------------------|------------------------|
| **Load More loads cards** | ✅ TC-LM-001 | ✅ TC-LM-003 | ✅ TC-LM-005 |
| **Loading state during fetch** | ✅ TC-LM-002 | ❌ | ❌ |
| **Error response** | ❌ | ✅ TC-LM-004 | ❌ |
| **Empty results disable button** | ✅ TC-LM-007 | ✅ TC-LM-008 | ✅ TC-LM-006 |

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Test case is implemented for this page |
| ❌ | Not covered on this page because the behavior is covered elsewhere |

### Rationale

- The successful loading path is checked on every endpoint because each page loads a different kind of content.
- The loading state is tested once on Home because all pages use the same LoadMore component.
- The error path is tested on Movies as a representative endpoint.
- The empty-result path is checked on all three pages because each page must keep the button visible and disable it when `hasMore` becomes false.

---

## Derived Test Cases

### TC-LM-001: Load More loads additional cards on Home

**Feature:** F-LM — Load More Trending Cards  
**Module:** Home (`/`)  
**Priority:** High  
**Type:** Functional black-box test  
**Tags:** `@loadmore`, `@home`, `@black-box`, `@regression`  
**Test File:** `tests/acceptance/loadmore/loadmore-home.spec.js`  

**Pre-Conditions:**
- The application is available at `http://localhost:5173`.
- The Home page contains at least one media card.
- The More results button is available.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/?locale=en-US` | Home page title is displayed |
| 2 | Wait for the initial card list | At least one card is visible |
| 3 | Store the initial card count | Count is greater than 0 |
| 4 | Click "More results" | A request for the next trending page is sent |
| 5 | Wait for the response | `/trending?page=*` returns 200 |
| 6 | Check the card list | Card count becomes greater than the initial count |

**Pass Criteria:** Additional cards are shown after the request completes.

---

### TC-LM-002: Load More shows loading state on Home

**Feature:** F-LM — Load More Trending Cards  
**Module:** Home (`/`)  
**Priority:** Medium  
**Type:** UX / accessibility black-box test  
**Tags:** `@loadmore`, `@home`, `@black-box`, `@regression`  
**Test File:** `tests/acceptance/loadmore/loadmore-home.spec.js`  

**Pre-Conditions:**
- The application is available at `http://localhost:5173`.
- The Home page contains at least one media card.
- The next trending request is delayed by 2 seconds.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/?locale=en-US` | Home page title is displayed |
| 2 | Wait for cards | At least one card is visible |
| 3 | Delay the next `/trending` request | Network delay is active |
| 4 | Click "More results" | Button enters loading state |
| 5 | Inspect button state | Button is disabled, has `aria-busy="true"`, and has the `loading` class |
| 6 | Wait for the response | The request returns 200 |
| 7 | Inspect button state | Button is enabled, has `aria-busy="false"`, and has no `loading` class |

**Pass Criteria:** The loading state is shown only during the request and is cleared afterwards.

---

### TC-LM-003: Load More loads additional cards on Movies

**Feature:** F-LM — Load More Trending Cards  
**Module:** Movies (`/movies`)  
**Priority:** High  
**Type:** Functional black-box test  
**Tags:** `@loadmore`, `@movies`, `@black-box`, `@regression`  
**Test File:** `tests/acceptance/loadmore/loadmore-movies.spec.js`  

**Pre-Conditions:**
- The application is available at `http://localhost:5173`.
- The Movies page contains at least one media card.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/movies?locale=en-US` | Movies page title is displayed |
| 2 | Wait for cards and store their count | At least one card is visible |
| 3 | Click "More results" | A request for the next movies page is sent |
| 4 | Wait for the response | `/movies?page=*` returns 200 |
| 5 | Check the card list | Card count becomes greater than the initial count |

**Pass Criteria:** Additional movie cards are shown after the request completes.

---

### TC-LM-004: Load More handles an error on Movies

**Feature:** F-LM — Load More Trending Cards  
**Module:** Movies (`/movies`)  
**Priority:** Medium  
**Type:** Edge-case black-box test  
**Tags:** `@loadmore`, `@movies`, `@black-box`, `@regression`  
**Test File:** `tests/acceptance/loadmore/loadmore-movies.spec.js`  

**Pre-Conditions:**
- The application is available at `http://localhost:5173`.
- The Movies page contains at least one media card.
- The next movies request is mocked to return HTTP 500.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/movies?locale=en-US` | Movies page title is displayed |
| 2 | Wait for cards and store their count | At least one card is visible |
| 3 | Mock the next movies request with HTTP 500 | Network mock is active |
| 4 | Click "More results" | Request is sent and fails with 500 |
| 5 | Verify button after request | Button is enabled, has `aria-busy="false"`, and has no `loading` class |
| 6 | Check the card list | Card count is unchanged |

**Pass Criteria:** The failed request does not add cards and the button leaves the loading state.

---

### TC-LM-005: Load More loads additional cards on TV Shows

**Feature:** F-LM — Load More Trending Cards  
**Module:** TV Shows (`/tv-shows`)  
**Priority:** High  
**Type:** Functional black-box test  
**Tags:** `@loadmore`, `@tvshows`, `@black-box`, `@regression`  
**Test File:** `tests/acceptance/loadmore/loadmore-tvshows.spec.js`  

**Pre-Conditions:**
- The application is available at `http://localhost:5173`.
- The TV Shows page contains at least one media card.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/tv-shows?locale=en-US` | TV Shows page title is displayed |
| 2 | Wait for cards and store their count | At least one card is visible |
| 3 | Click "More results" | A request for the next TV Shows page is sent |
| 4 | Wait for the response | `/tv-shows?page=*` returns 200 |
| 5 | Check the card list | Card count becomes greater than the initial count |

**Pass Criteria:** Additional TV Show cards are shown after the request completes.

---

### TC-LM-006: Load More disables button for empty TV Shows results

**Feature:** F-LM — Load More Trending Cards  
**Module:** TV Shows (`/tv-shows`)  
**Priority:** Low  
**Type:** Edge-case black-box test  
**Tags:** `@loadmore`, `@tvshows`, `@black-box`, `@regression`  
**Test File:** `tests/acceptance/loadmore/loadmore-tvshows.spec.js`  

**Pre-Conditions:**
- The application is available at `http://localhost:5173`.
- The TV Shows page contains at least one media card.
- The More results button is visible and enabled.
- The next TV Shows request is mocked to return `{ cards: [], page: 2, hasMore: false }`.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/tv-shows?locale=en-US` | TV Shows page title is displayed |
| 2 | Wait for cards | At least one card is visible |
| 3 | Verify initial button state | Button is visible and enabled |
| 4 | Mock the next page request | `/tv-shows?...page=2` returns an empty result |
| 5 | Click "More results" | Button enters loading state and the request is made |
| 6 | Wait for response | Response returns 200 with `cards: []` and `hasMore: false` |
| 7 | Verify loading completion | Button has `aria-busy="false"` |
| 8 | Check cards | Card count is unchanged |
| 9 | Verify no-more-results state | Button remains visible, is disabled, and has no `loading` class |

**Pass Criteria:** No cards are appended; the button is visible but disabled after the empty response.

---

### TC-LM-007: Load More disables button for empty Home results

**Feature:** F-LM — Load More Trending Cards  
**Module:** Home (`/`)  
**Priority:** Low  
**Type:** Edge-case black-box test  
**Tags:** `@loadmore`, `@home`, `@black-box`, `@regression`  
**Test File:** `tests/acceptance/loadmore/loadmore-home.spec.js`  

**Pre-Conditions:**
- The application is available at `http://localhost:5173`.
- The Home page contains at least one media card.
- The More results button is visible and enabled.
- The next trending request is mocked to return `{ cards: [], page: 2, hasMore: false }`.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/?locale=en-US` | Home page title is displayed |
| 2 | Wait for cards | At least one card is visible |
| 3 | Verify initial button state | Button is visible and enabled |
| 4 | Mock the next page request | `/trending?...page=2` returns an empty result |
| 5 | Click "More results" | Button enters loading state and the request is made |
| 6 | Wait for response | Response returns 200 with `cards: []` and `hasMore: false` |
| 7 | Verify loading completion | Button has `aria-busy="false"` |
| 8 | Check cards | Card count is unchanged |
| 9 | Verify no-more-results state | Button remains visible, is disabled, and has no `loading` class |

**Pass Criteria:** No cards are appended; the button is visible but disabled after the empty response.

---

### TC-LM-008: Load More disables button for empty Movies results

**Feature:** F-LM — Load More Trending Cards  
**Module:** Movies (`/movies`)  
**Priority:** Low  
**Type:** Edge-case black-box test  
**Tags:** `@loadmore`, `@movies`, `@black-box`, `@regression`  
**Test File:** `tests/acceptance/loadmore/loadmore-movies.spec.js`  

**Pre-Conditions:**
- The application is available at `http://localhost:5173`.
- The Movies page contains at least one media card.
- The More results button is visible and enabled.
- The next movies request is mocked to return `{ cards: [], page: 2, hasMore: false }`.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/movies?locale=en-US` | Movies page title is displayed |
| 2 | Wait for cards | At least one card is visible |
| 3 | Verify initial button state | Button is visible and enabled |
| 4 | Mock the next page request | `/movies?...page=2` returns an empty result |
| 5 | Click "More results" | Button enters loading state and the request is made |
| 6 | Wait for response | Response returns 200 with `cards: []` and `hasMore: false` |
| 7 | Verify loading completion | Button has `aria-busy="false"` |
| 8 | Check cards | Card count is unchanged |
| 9 | Verify no-more-results state | Button remains visible, is disabled, and has no `loading` class |

**Pass Criteria:** No cards are appended; the button is visible but disabled after the empty response.

---

## Gherkin User Stories

### Feature: Load More Trending Cards (F-LM)

**As** a visitor of the TMDB website  
**I want** to load more media cards using a button  
**So that** I can discover additional content without a page reload

```gherkin
Background:
  Given the application is available in the browser

@TC-LM-001
Scenario: Load more cards on Home
  Given I am on the Home page "/"
  And the initial card count is greater than 0
  When I click the "More results" button
  And the next trending response completes successfully
  Then the card count should be greater than the initial count

@TC-LM-002
Scenario: Show loading state while Home results load
  Given I am on the Home page "/"
  And the next trending response is delayed
  When I click the "More results" button
  Then the button should be disabled
  And the button should have aria-busy="true"
  And the button should have the "loading" CSS class
  When the response completes and more results are available
  Then the button should be enabled
  And the button should have aria-busy="false"
  And the button should not have the "loading" CSS class

@TC-LM-003
Scenario: Load more cards on Movies
  Given I am on the Movies page "/movies"
  And the initial card count is greater than 0
  When I click the "More results" button
  And the next movies response completes successfully
  Then the card count should be greater than the initial count

@TC-LM-004
Scenario: Handle a Movies error response
  Given I am on the Movies page "/movies"
  And the next movies response returns HTTP 500
  When I click the "More results" button
  Then no new cards should be added
  And the button should have aria-busy="false"
  And the button should not have the "loading" CSS class

@TC-LM-005
Scenario: Load more cards on TV Shows
  Given I am on the TV Shows page "/tv-shows"
  And the initial card count is greater than 0
  When I click the "More results" button
  And the next TV Shows response completes successfully
  Then the card count should be greater than the initial count

@TC-LM-006
Scenario: Disable button for empty TV Shows results
  Given I am on the TV Shows page "/tv-shows"
  And the "More results" button is visible and enabled
  And the next response contains no cards and hasMore=false
  When I click the "More results" button
  Then no new cards should be added
  And the button should remain visible and be disabled
  And the button should have aria-busy="false"
  And the button should not have the "loading" CSS class

@TC-LM-007
Scenario: Disable button for empty Home results
  Given I am on the Home page "/"
  And the "More results" button is visible and enabled
  And the next response contains no cards and hasMore=false
  When I click the "More results" button
  Then no new cards should be added
  And the button should remain visible and be disabled
  And the button should have aria-busy="false"
  And the button should not have the "loading" CSS class

@TC-LM-008
Scenario: Disable button for empty Movies results
  Given I am on the Movies page "/movies"
  And the "More results" button is visible and enabled
  And the next response contains no cards and hasMore=false
  When I click the "More results" button
  Then no new cards should be added
  And the button should remain visible and be disabled
  And the button should have aria-busy="false"
  And the button should not have the "loading" CSS class
```

---

## Run Tests

```bash
# All acceptance tests
just test-acceptance

# All Load More tests
npx playwright test tests/acceptance/loadmore/

# Per page
npx playwright test tests/acceptance/loadmore/loadmore-home.spec.js
npx playwright test tests/acceptance/loadmore/loadmore-movies.spec.js
npx playwright test tests/acceptance/loadmore/loadmore-tvshows.spec.js

# A single test by test ID
npx playwright test -g "TC-LM-007"
npx playwright test -g "TC-LM-008"
npx playwright test -g "TC-LM-006"

# All empty-results scenarios
npx playwright test -g "handles empty results"

# UI mode for an individual scenario
npx playwright test tests/acceptance/loadmore/loadmore-tvshows.spec.js -g "TC-LM-006" --ui

# Filter by tag
npx playwright test -g "@loadmore"
npx playwright test -g "@black-box"
npx playwright test -g "@regression"
```

---

## Notes

- **Test files:**
  - `tests/acceptance/loadmore/loadmore-home.spec.js` — TC-LM-001, TC-LM-002, TC-LM-007
  - `tests/acceptance/loadmore/loadmore-movies.spec.js` — TC-LM-003, TC-LM-004, TC-LM-008
  - `tests/acceptance/loadmore/loadmore-tvshows.spec.js` — TC-LM-005, TC-LM-006
- **Network mocks:** TC-LM-002 delays the trending request; TC-LM-004 returns HTTP 500; TC-LM-006 through TC-LM-008 return an empty card list with `hasMore: false`.
- **No-more-results behavior:** As long as the page contains cards, the LoadMore component stays rendered. If `hasMore` is false, its button remains visible and disabled, has `aria-busy="false"`, and has no `loading` CSS class.
- **Tags:** `@loadmore`, `@home`, `@movies`, `@tvshows`, `@black-box`, `@regression`

---

## Traceability Matrix

| Test Case | Feature | Module | Type | Priority | Tags |
|-----------|---------|--------|------|----------|------|
| TC-LM-001 | F-LM | Home (`/`) | Functional (Black-Box) | High | `@loadmore`, `@home`, `@black-box`, `@regression` |
| TC-LM-002 | F-LM | Home (`/`) | UX / Accessibility (Black-Box) | Medium | `@loadmore`, `@home`, `@black-box`, `@regression` |
| TC-LM-003 | F-LM | Movies (`/movies`) | Functional (Black-Box) | High | `@loadmore`, `@movies`, `@black-box`, `@regression` |
| TC-LM-004 | F-LM | Movies (`/movies`) | Edge Case (Black-Box) | Medium | `@loadmore`, `@movies`, `@black-box`, `@regression` |
| TC-LM-005 | F-LM | TV Shows (`/tv-shows`) | Functional (Black-Box) | High | `@loadmore`, `@tvshows`, `@black-box`, `@regression` |
| TC-LM-006 | F-LM | TV Shows (`/tv-shows`) | Edge Case (Black-Box) | Low | `@loadmore`, `@tvshows`, `@black-box`, `@regression` |
| TC-LM-007 | F-LM | Home (`/`) | Edge Case (Black-Box) | Low | `@loadmore`, `@home`, `@black-box`, `@regression` |
| TC-LM-008 | F-LM | Movies (`/movies`) | Edge Case (Black-Box) | Low | `@loadmore`, `@movies`, `@black-box`, `@regression` |