# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier
- **Project:** TMDB SvelteKit Frontend
- **Module:** Load More (Trending Cards)
- **Version:** 1.0
- **Date:** 2026-09-07

### 2. Introduction
The purpose of this test plan is to validate the "Load More" functionality for trending cards from a user's perspective. The tests ensure that additional content can be loaded dynamically, the loading state is properly indicated, and the button returns to an interactive state after the fetch completes.

### 3. Test Items
- Trending cards section on home page
- "More results" button (`button[aria-label="More results"]`)
- API endpoint: `/trending?page=*`
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

### 7. Item Pass/Fail Criteria
- **Pass:** All test steps successful, no errors in console log, button state transitions correct, card count increases
- **Fail:** At least one step failed or assertion failed

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
Scenario: Load More button loads additional cards
  Given the initial card count is greater than 0
  When I click the "More results" button
  And the API response for "/trending?page=2" completes
  Then the card count should be greater than the initial count

@TC-LM-002
Scenario: Load More button shows loading state during fetch
  Given the app is available in the browser
  And I am on the home page "/"
  And the API has an artificial delay of 2 seconds
  When I click the "More results" button
  Then the button should be disabled
  And the button should have aria-busy="true"
  And when the API response completes
  Then the button should be enabled
  And the button should have aria-busy="false"
```

---

## Test Case Specifications

### TC-LM-001: Load More button loads additional cards

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

---

### TC-LM-002: Load More button shows loading state during fetch

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

---

## Run Tests

```bash
# All acceptance tests
just test-acceptance

# Only load more tests
npx playwright test tests/acceptance/loadmore/loadmore.spec.js

# With UI mode
npx playwright test tests/acceptance/loadmore/loadmore.spec.js --ui

# Headed mode (visible browser)
npx playwright test tests/acceptance/loadmore/loadmore.spec.js --headed
```

---

## Notes

- **Test File:** `tests/acceptance/loadmore/loadmore.spec.js`
- **Test Cases:** TC-LM-001, TC-LM-002
- **Dependencies:** None (uses live API via dev server)
- **Network Mocking:** Used only in TC-LM-002 to simulate slow network
- **Future Tests:** Error handling, empty results, pagination edge cases