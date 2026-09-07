# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier
- **Project:** TMDB SvelteKit Frontend
- **Module:** Main Navigation
- **Version:** 1.3
- **Date:** 2026-09-07

### 2. Introduction
The purpose of this test plan is to validate the main navigation from a user's perspective. The tests ensure that navigation between the main pages (Home, Movies, TV Shows) works correctly on both desktop and mobile devices.

### 3. Test Items
- `HeaderMain.svelte` — Global header with navigation
- Navigation routes: `/`, `/movies`, `/tv-shows`
- Mobile menu (burger icon)
- Active link status (`aria-current="page"`)
- Menu close behavior (click outside)

### 4. Features to be tested
- Navigation between main pages (desktop)
- Mobile menu open/close (burger)
- Navigation in mobile mode
- Menu closes when clicking outside
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
- **Viewports:** Desktop (default) + Mobile (370x667)
- **Selectors:** Role-based (`getByRole('button')`, `getByRole('link')`), CSS ID-based (`#home`, `#movies`, `#tvshows`)
- **Test Design Technique:** Decision Table Testing (ISTQB Black-Box)
- **Tags:** `@navigation`, `@desktop`, `@mobile`, `@black-box`, `@regression`

### 7. Item Pass/Fail Criteria
- **Pass:** All test steps successful, no errors in console log, URL + title + aria-current correct
- **Fail:** At least one step failed or assertion failed

---

## Decision Table (Test Coverage Matrix)

The following decision table shows which test variants are executed for each viewport type. This approach ensures comprehensive coverage of both desktop and mobile navigation scenarios.

| Test Variant / Feature | Desktop | Mobile (370x667) |
|------------------------|---------|------------------|
| **Navigation works** (Functional) | ✅ TC-NAV-001 | ✅ TC-NAV-002 |
| **Menu closes outside click** (Edge Case) | ❌ | ✅ TC-NAV-003 |

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Test case implemented for this viewport |
| ❌ | Not applicable (mobile-only feature) |

### Rationale

- **Navigation works**: Tested on both desktop and mobile to ensure core functionality across viewports.
- **Menu closes outside click**: Mobile-only feature since desktop doesn't use the burger menu.

---

## Derived Test Cases

Based on the decision table above, the following test cases are derived:

### TC-NAV-001: Desktop navigation works

**Feature:** F-NAV (Main Navigation)  
**Module:** Desktop (`/`, `/movies`, `/tv-shows`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@navigation`, `@desktop`, `@black-box`, `@regression`  

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
- All page transitions work correctly
- Active link is properly marked

**Test File:** `tests/acceptance/navigation.spec.js`

---

### TC-NAV-002: Mobile navigation works

**Feature:** F-NAV (Main Navigation)  
**Module:** Mobile (`/`, `/movies`, `/tv-shows`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@navigation`, `@mobile`, `@black-box`, `@regression`  

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 370x667 (mobile)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/" | URL is "/" |
| 2 | Set viewport to 370x667 | Mobile layout active |
| 3 | Click burger menu button | Mobile menu opens |
| 4 | Click "TV shows" link | URL is "/tv-shows" |
| 5 | Verify title | Title contains "TV TMDB" |
| 6 | Click burger menu button | Mobile menu opens |
| 7 | Click "Home" link | URL is "/" |
| 8 | Verify title | Title contains "Home TMDB" |

**Pass/Fail Criteria:**
- All steps successful
- Mobile menu opens/closes correctly
- Navigation links work in mobile mode
- No errors in browser console log

**Test File:** `tests/acceptance/navigation.spec.js`

---

### TC-NAV-003: Mobile menu closes when clicking outside

**Feature:** F-NAV (Main Navigation)  
**Module:** Mobile (`/`)  
**Priority:** Medium  
**Type:** Edge Case (Black-Box)  
**Tags:** `@navigation`, `@mobile`, `@black-box`, `@regression`  

**Pre-Conditions:**
- App running on `localhost:4173`
- Browser: Chromium, viewport: 370x667 (mobile)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to "/" | URL is "/" |
| 2 | Set viewport to 370x667 | Mobile layout active |
| 3 | Click burger menu button | Mobile menu opens |
| 4 | Verify navigation links visible | Home link is visible |
| 5 | Click outside menu (main content) | Menu should close |
| 6 | Verify navigation links hidden | Home link is hidden |
| 7 | Verify aria-expanded | Button has `aria-expanded="false"` |

**Pass/Fail Criteria:**
- All steps successful
- Menu closes when clicking outside
- aria-expanded attribute updates correctly
- No errors in browser console log

**Test File:** `tests/acceptance/navigation.spec.js`

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
  And I have a mobile screen size (370x667)
  When I open the burger menu (click on button)
  And I click the "TV shows" navigation link
  Then the URL should be "/tv-shows"
  And the page title should contain "TV TMDB"

  When I open the burger menu again
  And I click the "Home" navigation link
  Then the URL should be "/"
  And the page title should contain "Home TMDB"

@TC-NAV-003
Scenario: Mobile menu closes when clicking outside
  Given I am on the home page "/"
  And I have a mobile screen size (370x667)
  When I open the burger menu
  And the navigation links should be visible
  When I click outside the menu (on main content)
  Then the navigation links should be hidden
  And the burger button should have aria-expanded="false"
```

---

## Run Tests

```bash
# All acceptance tests
just test-acceptance

# Only navigation tests
npx playwright test tests/acceptance/navigation.spec.js

# Navigation tests by tag
npx playwright test -g @navigation
npx playwright test -g "@navigation|@loadmore"
npx playwright test -g "@desktop"
npx playwright test -g "@mobile"
npx playwright test -g "@black-box"
npx playwright test -g "@regression"

# Combined filters
npx playwright test -g "(?=.*@navigation)(?=.*@mobile)"
npx playwright test -g "@navigation" --grep-invert "@edge-case"

# With UI mode
npx playwright test tests/acceptance/navigation.spec.js --ui

# Headed mode (visible browser)
npx playwright test tests/acceptance/navigation.spec.js --headed
```

---

## Notes

- **Test File:** `tests/acceptance/navigation.spec.js`
- **Test Cases:** TC-NAV-001, TC-NAV-002, TC-NAV-003
- **Dependencies:** None (uses live dev server)
- **Viewport:** Desktop (default), Mobile (370x667)
- **Tags:** `@navigation`, `@desktop`, `@mobile`, `@black-box`, `@regression`
- **Future Tests:** LanguageSwitcher, TypeHeadSearch, Detail pages

---

## Traceability Matrix

| Test Case | Feature | Module | Type | Priority | Tags |
|-----------|---------|--------|------|----------|------|
| TC-NAV-001 | F-NAV | Desktop | Functional (Black-Box) | High | `@navigation`, `@desktop`, `@black-box`, `@regression` |
| TC-NAV-002 | F-NAV | Mobile | Functional (Black-Box) | High | `@navigation`, `@mobile`, `@black-box`, `@regression` |
| TC-NAV-003 | F-NAV | Mobile | Edge Case (Black-Box) | Medium | `@navigation`, `@mobile`, `@black-box`, `@regression` |