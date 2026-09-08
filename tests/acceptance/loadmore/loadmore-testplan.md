# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier
- **Project:** TMDB SvelteKit Frontend
- **Module:** Load More (Trending Cards)
- **Version:** 1.1
- **Date:** 2026-09-07

### 2. Introduction
The purpose of this test plan is to validate the "Load More" functionality for trending cards from a user's perspective. The tests ensure that additional content can be loaded dynamically, the loading state is properly indicated, and the button returns to an interactive state after the fetch completes.

### 3. Test Items
- Trending cards section on home page
- "More results" button (`button[aria-label="More results"]`)
- API endpoints: `/trending`, `/movies`, `/tv-shows`
- Loading state indicators (`disabled`, `aria-busy`)
- Card list: `ul.media-card-list > li`

### 4. Features to be tested
- Load More button loads additional cards
- Button shows loading state during fetch (`disabled`, `aria-busy="true"`)
- Button returns to enabled state after fetch completes (`aria-busy="false"`)
- Card count increases after successful load
- Network request is triggered correctly

### 5. Features not to be tested
- Pagination logic (page numbers)
- API response data structure
- Card rendering details (covered in component tests)
- Performance under heavy load
- Error handling (separate test planned)

### 6. Approach
- **Tool:** Playwright
- **Syntax:** Gherkin for user stories
- **Browser:** Chromium (default)
- **Viewport:** Desktop (default)
- **Selectors:** Role-based (`getByRole('button', { name: 'More results' })`), CSS (`ul.media-card-list > li`)
- **Network Mocking:** `page.route()` with artificial delay for loading state tests
- **Test Design Technique:** Decision Table Testing (ISTQB Black-Box)
- **Tags:** `@loadmore`, `@home`, `@movies`, `@tvshows`, `@black-box`, `@regression`

### 7. Item Pass/Fail Criteria
- **Pass:** All test steps successful, no errors in console log, button state transitions correct, card count increases
- **Fail:** At least one step failed or assertion failed

---

## Decision Table (Test Coverage Matrix)

The following decision table shows which test variants are executed for each page type. This approach ensures comprehensive coverage while avoiding excessive duplication.

| Test Variant / Feature | Home (`/`) | Movies (`/movies`) | TV Shows (`/tv-shows`) |
|------------------------|------------|-------------------|------------------------|
| **Load More loads cards** (Functional) | ✅ TC-LM-001 | ✅ TC-LM-003 | ✅ TC-LM-005 |
| **Loading state during fetch** (UX/A11y) | ✅ TC-LM-002 | ❌ | ❌ |
| **Error handling** (Edge Case) | ❌ | ✅ TC-LM-004 | ❌ |
| **Empty results** (Edge Case) | ❌ | ❌ | ✅ TC-LM-006 |

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Test case implemented for this page |
| ❌ | Not tested here (covered elsewhere) |

### Rationale

- **Load More loads cards**: Core functionality tested on all three pages to ensure API integration works correctly for each endpoint.
- **Loading state**: Tested once on Home page since the same component is used across all pages.
- **Error handling**: Tested on Movies page as representative example.
- **Empty results**: Tested on TV Shows page to cover edge case where no results are returned.

---

## Derived Test Cases

Based on the decision table above, the following test cases are derived:

### TC-LM-001: Load More button loads additional cards (Home)

**Feature:** F-LM (Load More Trending Cards)  
**Module:** Home Page (`/`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@loadmore`, `@home`, `@black-box`, `@regression`  

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, desktop viewport
- Home page loaded with trending cards

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/" | URL is "/" |
| 2 | Wait for initial cards | At least one card is visible |
| 3 | Count initial cards | Initial count > 0 |
| 4 | Click "More results" button | Button is clicked |
| 5 | Wait for API response | `/trending?page=*` returns 200 |
| 6 | Wait for cards to render | Card count increases |
| 7 | Verify final count | Final count > initial count |

**Pass/Fail Criteria:**
- All steps successful
- Card count increases after clicking button
- No errors in browser console log

**Test File:** `tests/acceptance/loadmore/loadmore-home.spec.js`

---

### TC-LM-002: Load More button shows loading state during fetch (Home)

**Feature:** F-LM (Load More Trending Cards)  
**Module:** Home Page (`/`)  
**Priority:** Medium  
**Type:** UX / Accessibility (Black-Box)  
**Tags:** `@loadmore`, `@home`, `@black-box`, `@regression`  

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, desktop viewport
- Home page loaded with trending cards
- API response artificially delayed (2 seconds)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/" | URL is "/" |
| 2 | Wait for initial cards | At least one card is visible |
| 3 | Click "More results" button | Button is clicked |
| 4 | Verify button is disabled | Button has `disabled` attribute |
| 5 | Verify aria-busy | Button has `aria-busy="true"` |
| 6 | Wait for API response | `/trending?page=*` returns 200 |
| 7 | Verify button is enabled | Button is not disabled |
| 8 | Verify aria-busy | Button has `aria-busy="false"` |

**Pass/Fail Criteria:**
- All steps successful
- Button shows loading state during fetch
- Button returns to enabled state after fetch
- No errors in browser console log

**Test File:** `tests/acceptance/loadmore/loadmore-home.spec.js`

---

### TC-LM-003: Load More button loads additional cards (Movies)

**Feature:** F-LM (Load More Trending Cards)  
**Module:** Movies Page (`/movies`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@loadmore`, `@movies`, `@black-box`, `@regression`  

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, desktop viewport
- Movies page loaded with trending cards

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/movies" | URL is "/movies" |
| 2 | Wait for initial cards | At least one card is visible |
| 3 | Count initial cards | Initial count > 0 |
| 4 | Click "More results" button | Button is clicked |
| 5 | Wait for API response | `/movies?page=*` returns 200 |
| 6 | Wait for cards to render | Card count increases |
| 7 | Verify final count | Final count > initial count |

**Pass/Fail Criteria:**
- All steps successful
- Card count increases after clicking button
- No errors in browser console log

**Test File:** `tests/acceptance/loadmore/loadmore-movies.spec.js`

---

### TC-LM-004: Load More handles error response (Movies)

**Feature:** F-LM (Load More Trending Cards)  
**Module:** Movies Page (`/movies`)  
**Priority:** Medium  
**Type:** Edge Case (Black-Box)  
**Tags:** `@loadmore`, `@movies`, `@black-box`, `@regression`  

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, desktop viewport
- Movies page loaded with trending cards
- API response mocked to return 500 error

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/movies" | URL is "/movies" |
| 2 | Wait for initial cards | At least one card is visible |
| 3 | Mock API to return 500 | Network mock active |
| 4 | Click "More results" button | Button is clicked |
| 5 | Wait for API response | `/movies?page=*` returns 500 |
| 6 | Verify error message | User-friendly error displayed |
| 7 | Verify button state | Button is enabled again |

**Pass/Fail Criteria:**
- All steps successful
- Error message is displayed
- Button returns to enabled state
- No JavaScript errors in console

**Test File:** `tests/acceptance/loadmore/loadmore-movies.spec.js`

---

### TC-LM-005: Load More button loads additional cards (TV Shows)

**Feature:** F-LM (Load More Trending Cards)  
**Module:** TV Shows Page (`/tv-shows`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@loadmore`, `@tvshows`, `@black-box`, `@regression`  

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, desktop viewport
- TV Shows page loaded with trending cards

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/tv-shows" | URL is "/tv-shows" |
| 2 | Wait for initial cards | At least one card is visible |
| 3 | Count initial cards | Initial count > 0 |
| 4 | Click "More results" button | Button is clicked |
| 5 | Wait for API response | `/tv-shows?page=*` returns 200 |
| 6 | Wait for cards to render | Card count increases |
| 7 | Verify final count | Final count > initial count |

**Pass/Fail Criteria:**
- All steps successful
- Card count increases after clicking button
- No errors in browser console log

**Test File:** `tests/acceptance/loadmore/loadmore-tvshows.spec.js`

---

### TC-LM-006: Load More handles empty results (TV Shows)

**Feature:** F-LM (Load More Trending Cards)  
**Module:** TV Shows Page (`/tv-shows`)  
**Priority:** Low  
**Type:** Edge Case (Black-Box)  
**Tags:** `@loadmore`, `@tvshows`, `@black-box`, `@regression`  

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, desktop viewport
- TV Shows page loaded with trending cards
- API response mocked to return empty results

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/tv-shows" | URL is "/tv-shows" |
| 2 | Wait for initial cards | At least one card is visible |
| 3 | Mock API to return empty results | Network mock active |
| 4 | Click "More results" button | Button is clicked |
| 5 | Wait for API response | `/tv-shows?page=*` returns 200 with empty array |
| 6 | Verify no new cards | Card count unchanged |
| 7 | Verify button state | Button is disabled or hidden |

**Pass/Fail Criteria:**
- All steps successful
- No new cards are added
- Button is disabled or hidden to indicate no more results
- No errors in browser console log

**Test File:** `tests/acceptance/loadmore/loadmore-tvshows.spec.js`

---

## Gherkin User Stories

### Feature: Load More Trending Cards (F-LM)

**As** a visitor of the TMDB website  
**I want** to load more trending cards by clicking a button  
**So that** I can discover additional content without page reload

```
Background:
  Given the app is available in the browser
  And I am on the home page "/"

@TC-LM-001
Scenario: Load More button loads additional cards (Home)
  Given the initial card count is greater than 0
  When I click the "More results" button
  And the API response for "/trending?page=2" completes
  Then the card count should be greater than the initial count

@TC-LM-002
Scenario: Load More button shows loading state during fetch (Home)
  Given the app is available in the browser
  And I am on the home page "/"
  And the API has an artificial delay of 2 seconds
  When I click the "More results" button
  Then the button should be disabled
  And the button should have aria-busy="true"
  And when the API response completes
  Then the button should be enabled
  And the button should have aria-busy="false"

@TC-LM-003
Scenario: Load More button loads additional cards (Movies)
  Given I am on the movies page "/movies"
  And the initial card count is greater than 0
  When I click the "More results" button
  And the API response for "/movies?page=2" completes
  Then the card count should be greater than the initial count

@TC-LM-004
Scenario: Load More handles error response (Movies)
  Given I am on the movies page "/movies"
  And the API returns a 500 error
  When I click the "More results" button
  Then an error message should be displayed
  And the button should be enabled again

@TC-LM-005
Scenario: Load More button loads additional cards (TV Shows)
  Given I am on the tv shows page "/tv-shows"
  And the initial card count is greater than 0
  When I click the "More results" button
  And the API response for "/tv-shows?page=2" completes
  Then the card count should be greater than the initial count

@TC-LM-006
Scenario: Load More handles empty results (TV Shows)
  Given I am on the tv shows page "/tv-shows"
  And the API returns empty results
  When I click the "More results" button
  Then no new cards should be added
  And the button should be disabled or hidden
```

---

## Run Tests

```bash
# All acceptance tests
just test-acceptance

# Only load more tests
npx playwright test tests/acceptance/loadmore/

# Only home page tests
npx playwright test tests/acceptance/loadmore/loadmore-home.spec.js

# Only movies page tests
npx playwright test tests/acceptance/loadmore/loadmore-movies.spec.js

# Only tv shows page tests
npx playwright test tests/acceptance/loadmore/loadmore-tvshows.spec.js

# With UI mode
npx playwright test tests/acceptance/loadmore/ --ui

# Headed mode (visible browser)
npx playwright test tests/acceptance/loadmore/ --headed

# By tag
npx playwright test -g '@loadmore'
npx playwright test -g "@loadmore|@navigation"
npx playwright test -g "@black-box"
npx playwright test -g "@regression"
```

---

## Notes

- **Test Files:**
  - `tests/acceptance/loadmore/loadmore-home.spec.js` (TC-LM-001, TC-LM-002)
  - `tests/acceptance/loadmore/loadmore-movies.spec.js` (TC-LM-003, TC-LM-004)
  - `tests/acceptance/loadmore/loadmore-tvshows.spec.js` (TC-LM-005, TC-LM-006)
- **Test Cases:** TC-LM-001 to TC-LM-006
- **Dependencies:** None (uses live API via dev server, except mocked tests)
- **Network Mocking:** Used in TC-LM-002 (delay), TC-LM-004 (error), TC-LM-006 (empty)
- **Tags:** `@loadmore`, `@home`, `@movies`, `@tvshows`, `@black-box`, `@regression`
- **Future Tests:** Performance, offline mode, pagination edge cases

---

## Traceability Matrix

| Test Case | Feature | Module | Type | Priority | Tags |
|-----------|---------|--------|------|----------|------|
| TC-LM-001 | F-LM | Home (`/`) | Functional (Black-Box) | High | `@loadmore`, `@home`, `@black-box`, `@regression` |
| TC-LM-002 | F-LM | Home (`/`) | UX / A11y (Black-Box) | Medium | `@loadmore`, `@home`, `@black-box`, `@regression` |
| TC-LM-003 | F-LM | Movies (`/movies`) | Functional (Black-Box) | High | `@loadmore`, `@movies`, `@black-box`, `@regression` |
| TC-LM-004 | F-LM | Movies (`/movies`) | Edge Case (Black-Box) | Medium | `@loadmore`, `@movies`, `@black-box`, `@regression` |
| TC-LM-005 | F-LM | TV Shows (`/tv-shows`) | Functional (Black-Box) | High | `@loadmore`, `@tvshows`, `@black-box`, `@regression` |
| TC-LM-006 | F-LM | TV Shows (`/tv-shows`) | Edge Case (Black-Box) | Low | `@loadmore`, `@tvshows`, `@black-box`, `@regression` |