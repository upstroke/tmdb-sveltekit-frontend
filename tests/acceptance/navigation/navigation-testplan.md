# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB SvelteKit Frontend
- **Module:** Main Navigation
- **Version:** 1.4
- **Date:** 2026-09-15

### 2. Introduction

The purpose of this test plan is to validate the main navigation from a user's perspective. The tests ensure that navigation between the main pages (Home, Movies, TV Shows) works correctly on desktop and mobile viewports, including burger-menu behavior.

### 3. Test Items

- `HeaderMain.svelte` — Global header with navigation
- Navigation routes: `/`, `/movies`, `/tv-shows`
- Mobile menu (burger icon)
- Active link status (`aria-current="page"`)
- Menu close behavior (burger button and outside click)

### 4. Features to be tested

- Navigation between main pages on desktop
- Mobile burger menu opens and closes
- Navigation links work in mobile mode
- Menu closes when clicking outside
- Correct page titles per route
- Active link status on desktop

### 5. Features not to be tested

- LanguageSwitcher (separate test planned)
- TypeHeadSearch (separate test planned)
- Detail pages for movies/shows (later)
- Pagination / Load More (later)

### 6. Approach

- **Tool:** Playwright
- **Syntax:** Gherkin for user stories
- **Browser:** Chromium (default)
- **Viewports:** Desktop (1920x1080) + Mobile (370x667)
- **Selectors:** Role-based (`getByRole('button')`, `getByRole('link')`), CSS ID-based (`#home`, `#movies`, `#tvshows`)
- **Test Design Technique:** Decision Table Testing (ISTQB Black-Box)
- **Tags:** `@navigation`, `@desktop`, `@mobile`, `@burger-menu`, `@black-box`, `@regression`, `@a11y`
- **Test File:** `tests/acceptance/navigation/navigation.spec.js`

### 7. Item Pass/Fail Criteria

- **Pass:** All test steps successful, no errors in console log, URL + title + aria-current/aria-expanded correct where applicable
- **Fail:** At least one step failed or assertion failed

---

## Decision Table (Test Coverage Matrix)

| Test Variant / Feature | Desktop | Mobile (370x667) |
|------------------------|---------|------------------|
| **Main navigation works** | ✅ TC-NAV-001 | ✅ TC-NAV-003 |
| **Burger menu opens/closes** | ❌ | ✅ TC-NAV-002 |
| **Menu closes on outside click** | ❌ | ✅ TC-NAV-004 |

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Test case implemented for this viewport |
| ❌ | Not applicable (mobile-only feature) |

### Rationale

- **Main navigation works:** Desktop navigation is tested independently; mobile navigation is tested through the burger menu.
- **Burger menu opens/closes:** Mobile-only behavior is verified explicitly.
- **Menu closes on outside click:** This is a mobile-only burger-menu behavior.

---

## Derived Test Cases

### TC-NAV-001: Desktop navigation works

**Feature:** F-NAV (Main Navigation)  
**Module:** Desktop (`/`, `/movies`, `/tv-shows`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@navigation`, `@desktop`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**

- App running on `localhost:4173`
- Browser: Chromium, desktop viewport (1920x1080)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Click `#movies a` | URL is `/movies` |
| 3 | Verify title | Title contains `Movies` and `TMDB` |
| 4 | Verify aria-current | `#movies a` has `aria-current="page"` |
| 5 | Click `#tvshows a` | URL is `/tv-shows` |
| 6 | Verify title | Title contains `TV` and `TMDB` |
| 7 | Verify aria-current | `#tvshows a` has `aria-current="page"` |
| 8 | Click `#home a` | URL is `/` |
| 9 | Verify title | Title contains `Home` and `TMDB` |
| 10 | Verify aria-current | `#home a` has `aria-current="page"` |

**Pass/Fail Criteria:**

- All steps successful
- No errors in browser console log
- All page transitions work correctly
- Active link is properly marked

**Test File:** `tests/acceptance/navigation/navigation.spec.js`

---

### TC-NAV-002: Mobile burger menu opens and closes

**Feature:** F-NAV (Main Navigation)  
**Module:** Mobile (`/`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@navigation`, `@mobile`, `@burger-menu`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**

- App running on `localhost:4173`
- Browser: Chromium, viewport: 370x667

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Confirm viewport is 370x667 | Mobile layout is active and burger button is visible |
| 3 | Verify initial state | Burger button has `aria-expanded="false"`; Home link is hidden |
| 4 | Open burger menu | Burger button has `aria-expanded="true"`; Home link is visible |
| 5 | Close burger menu | Burger button has `aria-expanded="false"`; Home link is hidden |

**Pass/Fail Criteria:**

- All steps successful
- Mobile menu opens and closes correctly
- `aria-expanded` reflects the menu state
- No errors in browser console log

**Test File:** `tests/acceptance/navigation/navigation.spec.js`

---

### TC-NAV-003: Mobile navigation links work

**Feature:** F-NAV (Main Navigation)  
**Module:** Mobile (`/`, `/tv-shows`, `/movies`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@navigation`, `@mobile`, `@burger-menu`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**

- App running on `localhost:4173`
- Browser: Chromium, viewport: 370x667

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Open burger menu | Mobile navigation links are visible |
| 3 | Click `TV shows` | URL is `/tv-shows` and title contains `TV` and `TMDB` |
| 4 | Open burger menu on TV Shows | Mobile navigation links are visible |
| 5 | Click `Home` | URL is `/` and title contains `Home` and `TMDB` |
| 6 | Open burger menu on Home | Mobile navigation links are visible |
| 7 | Click `Movies` | URL is `/movies` and title contains `Movies` and `TMDB` |

**Pass/Fail Criteria:**

- All steps successful
- Mobile navigation links work on all tested routes
- Page titles are correct
- No errors in browser console log

**Test File:** `tests/acceptance/navigation/navigation.spec.js`

---

### TC-NAV-004: Mobile menu closes when clicking outside

**Feature:** F-NAV (Main Navigation)  
**Module:** Mobile (`/`)  
**Priority:** Medium  
**Type:** Edge Case (Black-Box)  
**Tags:** `@navigation`, `@mobile`, `@burger-menu`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**

- App running on `localhost:4173`
- Browser: Chromium, viewport: 370x667

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/?locale=en-US` | Home page is displayed |
| 2 | Confirm viewport is 370x667 | Mobile layout is active |
| 3 | Open burger menu | Burger button has `aria-expanded="true"`; Home link is visible |
| 4 | Click outside menu at `(340, 500)` | Menu closes |
| 5 | Verify closed state | Burger button has `aria-expanded="false"`; Home link is hidden |

**Pass/Fail Criteria:**

- All steps successful
- Menu closes when clicking outside
- `aria-expanded` updates correctly
- No errors in browser console log

**Test File:** `tests/acceptance/navigation/navigation.spec.js`

---

## Gherkin User Stories

### Feature: Main Navigation (F-NAV)

**As** a visitor of the TMDB website  
**I want** to navigate between the main pages (Home, Movies, TV Shows)  
**So that** I can discover movies and series


Background:
  Given the app is available in the browser

@TC-NAV-001
Scenario: Desktop navigation works
  Given I am on the home page "/"
  When I click the "Movies" navigation link
  Then the URL should be "/movies"
  And the page title should contain "Movies" and "TMDB"
  And the "Movies" link should be marked as active (aria-current="page")

  When I click the "TV Shows" navigation link
  Then the URL should be "/tv-shows"
  And the page title should contain "TV" and "TMDB"
  And the "TV Shows" link should be marked as active

  When I click the "Home" navigation link
  Then the URL should be "/"
  And the page title should contain "Home" and "TMDB"
  And the "Home" link should be marked as active

@TC-NAV-002
Scenario: Mobile burger menu opens and closes
  Given I am on the home page "/"
  And I have a mobile screen size (370x667)
  Then the burger button should have aria-expanded="false"
  When I open the burger menu
  Then the burger button should have aria-expanded="true"
  And the "Home" link should be visible
  When I close the burger menu
  Then the burger button should have aria-expanded="false"
  And the "Home" link should be hidden

@TC-NAV-003
Scenario: Mobile navigation links work
  Given I am on the home page "/"
  And I have a mobile screen size (370x667)
  When I open the burger menu
  And I click the "TV shows" navigation link
  Then the URL should be "/tv-shows"
  And the page title should contain "TV" and "TMDB"

  When I open the burger menu again
  And I click the "Home" navigation link
  Then the URL should be "/"
  And the page title should contain "Home" and "TMDB"

  When I open the burger menu again
  And I click the "Movies" navigation link
  Then the URL should be "/movies"
  And the page title should contain "Movies" and "TMDB"

@TC-NAV-004
Scenario: Mobile menu closes when clicking outside
  Given I am on the home page "/"
  And I have a mobile screen size (370x667)
  When I open the burger menu
  Then the navigation links should be visible
  When I click outside the menu on the main content
  Then the navigation links should be hidden
  And the burger button should have aria-expanded="false"
