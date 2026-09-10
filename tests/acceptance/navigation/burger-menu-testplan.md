# Acceptance Tests
## Test Plan

### 1. Test Plan Identifier
**Project:** TMDB SvelteKit Frontend  
**Module:** Burger Menu (Mobile Navigation)  
**Version:** 1.0  
**Date:** 2026-09-10  

---

### 2. Introduction
The purpose of this test plan is to validate the functional behavior of the burger menu on mobile devices. The tests ensure that the mobile navigation opens, closes, and functions correctly across different interaction scenarios.

---

### 3. Test Items
- **Burger menu button** — Toggle for mobile navigation
- **Mobile navigation links** — Home, Movies, TV Shows
- **Menu close behavior** — Button toggle and outside click
- **ARIA attributes** — `aria-expanded` state management

---

### 4. Features to be tested
- Burger menu opens correctly
- Burger menu closes correctly (via button)
- Navigation links in burger menu work
- Menu closes when clicking outside
- ARIA `aria-expanded` attribute updates correctly

---

### 5. Features not to be tested
- Desktop navigation (covered in `navigation.spec.js`)
- Accessibility violations (covered in `navigation.a11y.spec.js`)
- Language switching behavior
- Search functionality

---

### 6. Approach
**Tool:** Playwright  
**Syntax:** JavaScript test functions with structured test case IDs  
**Browser:** Chromium (default)  
**Viewports:** Mobile (370x667)  
**Selectors:** Role-based (`getByRole('button')`, `getByRole('link')`)  
**Test Design Technique:** Decision Table Testing (ISTQB Black-Box)  
**Tags:** `@navigation`, `@mobile`, `@burger-menu`, `@black-box`, `@regression`, `@a11y`

---

### 7. Item Pass/Fail Criteria
**Pass:** 
- All test steps successful
- No errors in console log
- Menu opens/closes correctly
- Navigation links work as expected
- `aria-expanded` attribute updates correctly

**Fail:** 
- At least one step failed or assertion failed
- Menu does not open/close as expected
- Navigation links do not work

---

## Decision Table (Test Coverage Matrix)
The following decision table shows which test variants are executed for each burger menu interaction.

| Test Variant / Feature | Open/Close | Navigation Works | Close Outside |
|------------------------|------------|------------------|---------------|
| Burger menu functional | ✅ TC-BURGER-001 | ✅ TC-BURGER-002 | ✅ TC-BURGER-003 |

**Legend**

| Symbol | Meaning |
|--------|---------|
| ✅ | Test case implemented for this feature |

**Rationale**

- **Open/Close:** Core functionality of the burger menu toggle.
- **Navigation Works:** Primary purpose of the menu — navigation to main pages.
- **Close Outside:** Important edge case for mobile UX.

---

## Derived Test Cases
Based on the decision table above, the following test cases are derived:

### TC-BURGER-001: Burger menu opens and closes correctly
**Feature:** F-BURGER (Burger Menu)  
**Module:** Mobile (/)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@navigation`, `@mobile`, `@burger-menu`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**
- App running on `localhost:5173`
- Browser: Chromium, viewport: 370x667 (mobile)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to "/?locale=en-US" | URL is "/" |
| 2 | Verify burger button visible | Button is visible |
| 3 | Verify `aria-expanded="false"` | Menu is closed |
| 4 | Verify navigation links hidden | Links are not visible |
| 5 | Click burger button | Menu opens |
| 6 | Verify `aria-expanded="true"` | Menu is open |
| 7 | Verify navigation links visible | Links are visible |
| 8 | Click burger button again | Menu closes |
| 9 | Verify `aria-expanded="false"` | Menu is closed |
| 10 | Verify navigation links hidden | Links are not visible |

**Pass/Fail Criteria:**
- All steps successful
- Menu opens/closes correctly
- `aria-expanded` attribute updates correctly
- No errors in browser console log

**Test File:** `tests/acceptance/navigation/burger-menu.spec.js`

---

### TC-BURGER-002: Burger menu navigation links work
**Feature:** F-BURGER (Burger Menu)  
**Module:** Mobile (/, /movies, /tv-shows)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@navigation`, `@mobile`, `@burger-menu`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**
- App running on `localhost:5173`
- Browser: Chromium, viewport: 370x667 (mobile)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to "/?locale=en-US" | URL is "/" |
| 2 | Click burger menu button | Menu opens |
| 3 | Wait for links visible | "TV shows" link is visible |
| 4 | Click "TV shows" link | URL is "/tv-shows" |
| 5 | Verify title | Title contains "TV TMDB" |
| 6 | Click burger menu button | Menu opens |
| 7 | Click "Home" link | URL is "/" |
| 8 | Verify title | Title contains "Home TMDB" |
| 9 | Click burger menu button | Menu opens |
| 10 | Click "Movies" link | URL is "/movies" |
| 11 | Verify title | Title contains "Movies TMDB" |

**Pass/Fail Criteria:**
- All steps successful
- All navigation links work correctly
- Page titles are correct after navigation
- No errors in browser console log

**Test File:** `tests/acceptance/navigation/burger-menu.spec.js`

---

### TC-BURGER-003: Burger menu closes when clicking outside
**Feature:** F-BURGER (Burger Menu)  
**Module:** Mobile (/)  
**Priority:** Medium  
**Type:** Edge Case (Black-Box)  
**Tags:** `@navigation`, `@mobile`, `@burger-menu`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**
- App running on `localhost:5173`
- Browser: Chromium, viewport: 370x667 (mobile)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to "/?locale=en-US" | URL is "/" |
| 2 | Click burger menu button | Menu opens |
| 3 | Verify `aria-expanded="true"` | Menu is open |
| 4 | Verify navigation links visible | Links are visible |
| 5 | Click outside menu (main content area) | Menu should close |
| 6 | Verify `aria-expanded="false"` | Menu is closed |
| 7 | Verify navigation links hidden | Links are not visible |

**Pass/Fail Criteria:**
- All steps successful
- Menu closes when clicking outside
- `aria-expanded` attribute updates correctly
- No errors in browser console log

**Test File:** `tests/acceptance/navigation/burger-menu.spec.js`

---

## Gherkin User Stories

### Feature: Burger Menu (F-BURGER)
As a mobile user  
I want to use the burger menu to navigate the site  
So that I can access all main pages on small screens

---

**Background:**
```gherkin
Given the app is available in the browser
And I have a mobile screen size (370x667)
```

---

**@TC-BURGER-001**
```gherkin
Scenario: Burger menu opens and closes correctly
  Given I am on the home page "/?locale=en-US"
  And the burger button is visible
  And the navigation links are hidden
  When I click the burger button
  Then the navigation links should be visible
  And the burger button should have aria-expanded="true"
  
  When I click the burger button again
  Then the navigation links should be hidden
  And the burger button should have aria-expanded="false"
```

---

**@TC-BURGER-002**
```gherkin
Scenario: Burger menu navigation links work
  Given I am on the home page "/?locale=en-US"
  When I open the burger menu
  And I click the "TV shows" navigation link
  Then the URL should be "/tv-shows"
  And the page title should contain "TV TMDB"
  
  When I open the burger menu again
  And I click the "Home" navigation link
  Then the URL should be "/"
  And the page title should contain "Home TMDB"
  
  When I open the burger menu again
  And I click the "Movies" navigation link
  Then the URL should be "/movies"
  And the page title should contain "Movies TMDB"
```

---

**@TC-BURGER-003**
```gherkin
Scenario: Burger menu closes when clicking outside
  Given I am on the home page "/?locale=en-US"
  When I open the burger menu
  And the navigation links are visible
  When I click outside the menu (on main content)
  Then the navigation links should be hidden
  And the burger button should have aria-expanded="false"
```

---

## Run Tests

```bash
# All burger menu tests
npx playwright test tests/acceptance/navigation/burger-menu.spec.js

# Burger menu tests by tag
npx playwright test -g @burger-menu

# Navigation + mobile + burger-menu
npx playwright test -g "(?=.*@navigation)(?=.*@mobile)(?=.*@burger-menu)"

# With UI mode
npx playwright test tests/acceptance/navigation/burger-menu.spec.js --ui

# Headed mode (visible browser)
npx playwright test tests/acceptance/navigation/burger-menu.spec.js --headed
```

---

## Notes
- **Test File:** `tests/acceptance/navigation/burger-menu.spec.js`
- **Test Cases:** TC-BURGER-001, TC-BURGER-002, TC-BURGER-003
- **Dependencies:** None (uses live dev server)
- **Viewport:** Mobile (370x667)
- **Tags:** `@navigation`, `@mobile`, `@burger-menu`, `@black-box`, `@regression`, `@a11y`
- **Related Tests:** `navigation.spec.js` (desktop navigation), `navigation.a11y.spec.js` (accessibility checks)

---

## Traceability Matrix

| Test Case | Feature | Module | Type | Priority | Tags |
|-----------|---------|--------|------|----------|------|
| TC-BURGER-001 | F-BURGER | Mobile (/) | Functional (Black-Box) | High | @navigation, @mobile, @burger-menu, @black-box, @regression, @a11y |
| TC-BURGER-002 | F-BURGER | Mobile (/, /movies, /tv-shows) | Functional (Black-Box) | High | @navigation, @mobile, @burger-menu, @black-box, @regression, @a11y |
| TC-BURGER-003 | F-BURGER | Mobile (/) | Edge Case (Black-Box) | Medium | @navigation, @mobile, @burger-menu, @black-box, @regression, @a11y |

---

## Relationship to Other Tests

### Navigation Tests (`navigation.spec.js`)
- **TC-NAV-001:** Desktop navigation (no burger menu)
- **TC-NAV-002:** Mobile navigation (includes burger menu, but focuses on navigation flow)
- **TC-NAV-003:** Mobile menu closes outside (duplicate with TC-BURGER-003, can be removed if burger-menu.spec.js is preferred)

### Accessibility Tests (`navigation.a11y.spec.js`)
- **TC-A11Y-002:** Homepage after opening navigation has no WCAG A/AA violations (checks accessibility, not functionality)

### Distinction
- **`burger-menu.spec.js`:** Functional tests for burger menu behavior
- **`navigation.spec.js`:** Overall navigation tests (desktop + mobile flows)
- **`navigation.a11y.spec.js`:** WCAG compliance checks in different states
