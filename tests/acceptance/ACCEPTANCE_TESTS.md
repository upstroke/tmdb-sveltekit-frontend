# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier
- **Project:** TMDB SvelteKit Frontend
- **Module:** Main Navigation
- **Version:** 1.0
- **Date:** 2026-09-04

### 2. Introduction
The purpose of this test plan is to validate the main navigation from a user's perspective. The tests ensure that navigation between the main pages (Home, Movies, TV Shows) works correctly on both desktop and mobile devices.

### 3. Test Items
- `HeaderMain.svelte` — Global header with navigation
- Navigation routes: `/`, `/movies`, `/tv-shows`
- Mobile menu (burger icon)
- Active link status (`aria-current="page"`)

### 4. Features to be tested
- Navigation between main pages (desktop)
- Mobile menu open/close (burger)
- Navigation in mobile mode
- Correct page titles per route
- Active link visually highlighted

### 5. Features not to be tested
- LanguageSwitcher (separate test planned)
- TypeHeadSearch (separate test planned)
- Detail pages for movies/shows (later)
- Pagination / Load More (later)

### 6. Approach
- **Tool:** Playwright
- **Syntax:** Gherkin for user stories
- **Browser:** Chromium (default)
- **Viewports:** Desktop (default) + Mobile (375x667)
- **Selectors:** CSS ID-based (`#home`, `#movies`, `#tvshows`, `#menu-toggle`)

### 7. Item Pass/Fail Criteria
- **Pass:** All test steps successful, no errors in console log, URL + title + aria-current correct
- **Fail:** At least one step failed or assertion failed

---

## Gherkin User Stories

### Feature: Main Navigation (F-NAV)

**As** a visitor of the TMDB website  
**I want** to be able to navigate between the main pages (Home, Movies, TV Shows)  
**So that** I can discover movies and series

```
Background:
  Given the app is available in the browser

@TC-NAV-001
Scenario: Desktop navigation works
  Given I am on the home page "/"
  When I click the "Movies" navigation link
  Then the URL should be "/movies"
  And the page title should contain "Movies TMDB"
  And the "Movies" link should be marked as active (aria-current="page")

  When I click the "TV Shows" navigation link
  Then the URL should be "/tv-shows"
  And the page title should contain "TV TMDB"
  And the "TV Shows" link should be marked as active

  When I click the "Home" navigation link
  Then the URL should be "/"
  And the page title should contain "Home TMDB"
  And the "Home" link should be marked as active

@TC-NAV-002
Scenario: Mobile navigation works
  Given I am on the home page "/"
  And I have a mobile screen size (375x667)
  When I open the burger menu (click on #menu-toggle)
  And I click the "Movies" navigation link
  Then the URL should be "/movies"
  And the page title should contain "Movies TMDB"

  When I open the burger menu again
  And I click the "TV Shows" navigation link
  Then the URL should be "/tv-shows"
  And the page title should contain "TV TMDB"
```

---

## Test Case Specifications

### TC-NAV-001: Desktop navigation works

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, desktop viewport

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/" | URL is "/" |
| 2 | Click `#movies a` | URL is "/movies" |
| 3 | Verify title | Title contains "Movies TMDB" |
| 4 | Verify aria-current | `#movies a` has `aria-current="page"` |
| 5 | Click `#tvshows a` | URL is "/tv-shows" |
| 6 | Verify title | Title contains "TV TMDB" |
| 7 | Verify aria-current | `#tvshows a` has `aria-current="page"` |
| 8 | Click `#home a` | URL is "/" |
| 9 | Verify title | Title contains "Home TMDB" |
| 10 | Verify aria-current | `#home a` has `aria-current="page"` |

**Pass/Fail Criteria:**
- All steps successful
- No errors in browser console log

---

### TC-NAV-002: Mobile navigation works

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 375x667 (mobile)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/" | URL is "/" |
| 2 | Set viewport to 375x667 | Mobile layout active |
| 3 | Click `#menu-toggle` | Mobile menu opens |
| 4 | Click `#movies a` | URL is "/movies" |
| 5 | Verify title | Title contains "Movies TMDB" |
| 6 | Click `#menu-toggle` | Mobile menu opens |
| 7 | Click `#tvshows a` | URL is "/tv-shows" |
| 8 | Verify title | Title contains "TV TMDB" |

**Pass/Fail Criteria:**
- All steps successful
- Mobile menu opens/closes correctly
- No errors in browser console log

---

## Run Tests

```bash
# All acceptance tests
just test-acceptance

# Only navigation tests
npx playwright test tests/acceptance/navigation.spec.js
```