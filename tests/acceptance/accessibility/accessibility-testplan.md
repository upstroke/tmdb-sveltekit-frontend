# Acceptance Tests
## Test Plan

### 1. Test Plan Identifier
**Project:** TMDB SvelteKit Frontend  
**Module:** Accessibility (A11Y)  
**Version:** 1.0  
**Date:** 2026-09-10  

---

### 2. Introduction
The purpose of this test plan is to validate the accessibility of the TMDB website from a WCAG 2.2 AA compliance perspective. The tests ensure that the homepage and key user interactions meet accessibility standards for users with disabilities.

---

### 3. Test Items
- **Homepage** (`/`) — Main landing page
- **Navigation menu** — Burger menu interaction
- **Search functionality** — TypeHeadSearch input
- **axe-core** — Automated WCAG A/AA violation detection

---

### 4. Features to be tested
- Homepage initial state has no WCAG A/AA violations
- Homepage after opening navigation has no WCAG A/AA violations
- Homepage after search interaction has no WCAG A/AA violations
- Proper focus management
- Keyboard accessibility
- Screen reader compatibility (manual testing planned for later)

---

### 5. Features not to be tested
- Movies page (not yet implemented)
- TV Shows page (not yet implemented)
- Movie detail pages (later)
- TV Show detail pages (later)
- Manual screen reader testing (planned for later phase)
- Manual keyboard-only navigation testing (planned for later phase)

---

### 6. Approach
**Tool:** Playwright + axe-core (`@axe-core/playwright`)  
**Syntax:** JavaScript test functions with structured test case IDs  
**Browser:** Chromium (default)  
**Viewports:** Desktop (1920x1080)  
**Selectors:** Role-based (`getByRole('button')`, `getByRole('searchbox')`, `getByRole('link')`)  
**Test Design Technique:** Automated WCAG scanning via axe-core  
**Tags:** `@accessibility`, `@homepage`, `@navigation`, `@search`, `@black-box`, `@regression`

---

### 7. Item Pass/Fail Criteria
**Pass:** 
- No WCAG A/AA violations detected by axe-core
- All test steps successful
- No errors in console log

**Fail:** 
- At least one WCAG A/AA violation detected
- Test step failed or assertion failed

---

## Decision Table (Test Coverage Matrix)
The following decision table shows which test variants are executed for each interaction state. This approach ensures comprehensive coverage of accessibility scenarios on the homepage.

| Test Variant / Feature | Initial State | After Navigation Open | After Search | Manual SR Test |
|------------------------|---------------|----------------------|--------------|----------------|
| No WCAG violations (Automated) | ✅ TC-A11Y-001 | ✅ TC-A11Y-002 | ✅ TC-A11Y-003 | ❌ |
| Keyboard navigation (Manual) | ❌ | ❌ | ❌ | 🔜 Future |
| Screen reader test (Manual) | ❌ | ❌ | ❌ | 🔜 Future |

**Legend**

| Symbol | Meaning |
|--------|---------|
| ✅ | Test case implemented for this state |
| ❌ | Not applicable or not yet implemented |
| 🔜 | Planned for future phase |

**Rationale**

- **No WCAG violations:** Automated testing via axe-core on homepage in different interaction states.
- **Keyboard navigation:** Planned for manual testing phase when core functionality is stable.
- **Screen reader test:** Planned for manual testing with NVDA/VoiceOver in later phase.

---

## Derived Test Cases
Based on the decision table above, the following test cases are derived:

### TC-A11Y-001: Homepage initial state has no WCAG A/AA violations
**Feature:** F-A11Y (Accessibility Checks)  
**Module:** Homepage (/)  
**Priority:** High  
**Type:** Automated (Black-Box)  
**Tags:** `@accessibility`, `@homepage`, `@black-box`, `@regression`

**Pre-Conditions:**
- App running on `localhost:5173`
- Browser: Chromium, desktop viewport (1920x1080)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to "/?locale=en-US" | URL is "/" |
| 2 | Verify page title | Title contains "Home TMDB" |
| 3 | Run axe-core accessibility check | No WCAG A/AA violations detected |

**Pass/Fail Criteria:**
- All steps successful
- No WCAG A/AA violations in axe-core report
- No errors in browser console log

**Test File:** `tests/acceptance/accessibility/navigation.a11y.spec.js`

---

### TC-A11Y-002: Homepage after opening navigation has no WCAG A/AA violations
**Feature:** F-A11Y (Accessibility Checks)  
**Module:** Homepage (/) + Navigation  
**Priority:** High  
**Type:** Automated (Black-Box)  
**Tags:** `@accessibility`, `@homepage`, `@navigation`, `@black-box`, `@regression`

**Pre-Conditions:**
- App running on `localhost:5173`
- Browser: Chromium, desktop viewport (1920x1080)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to "/?locale=en-US" | URL is "/" |
| 2 | Verify page title | Title contains "Home TMDB" |
| 3 | Click burger menu button | Mobile menu opens |
| 4 | Wait for navigation links visible | "TV shows" link is visible |
| 5 | Run axe-core accessibility check | No WCAG A/AA violations detected |

**Pass/Fail Criteria:**
- All steps successful
- No WCAG A/AA violations in axe-core report
- No errors in browser console log
- Navigation menu opens correctly

**Test File:** `tests/acceptance/accessibility/navigation.a11y.spec.js`

---

### TC-A11Y-003: Homepage after search interaction has no WCAG A/AA violations
**Feature:** F-A11Y (Accessibility Checks)  
**Module:** Homepage (/) + Search  
**Priority:** Medium  
**Type:** Automated (Black-Box)  
**Tags:** `@accessibility`, `@homepage`, `@search`, `@black-box`, `@regression`

**Pre-Conditions:**
- App running on `localhost:5173`
- Browser: Chromium, desktop viewport (1920x1080)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to "/?locale=en-US" | URL is "/" |
| 2 | Verify page title | Title contains "Home TMDB" |
| 3 | Locate search input | Searchbox is visible |
| 4 | Fill search input with "breaking" | Text entered |
| 5 | Wait for debounce (500ms) | Search results appear |
| 6 | Run axe-core accessibility check | No WCAG A/AA violations detected |

**Pass/Fail Criteria:**
- All steps successful
- No WCAG A/AA violations in axe-core report
- No errors in browser console log
- Search interaction works correctly

**Test File:** `tests/acceptance/accessibility/navigation.a11y.spec.js`

---

## Gherkin User Stories

### Feature: Accessibility Checks (F-A11Y)
As a user with disabilities  
I want the TMDB website to be accessible  
So that I can navigate and use all features without barriers

---

**Background:**
```gherkin
Given the app is available in the browser
And the viewport is set to desktop (1920x1080)
```

---

**@TC-A11Y-001**
```gherkin
Scenario: Homepage initial state has no WCAG A/AA violations
  Given I am on the home page "/?locale=en-US"
  And the page title contains "Home TMDB"
  When I run the axe-core accessibility check
  Then no WCAG A/AA violations should be detected
```

---

**@TC-A11Y-002**
```gherkin
Scenario: Homepage after opening navigation has no WCAG A/AA violations
  Given I am on the home page "/?locale=en-US"
  And the page title contains "Home TMDB"
  When I click the burger menu button
  And the navigation links are visible
  And I run the axe-core accessibility check
  Then no WCAG A/AA violations should be detected
```

---

**@TC-A11Y-003**
```gherkin
Scenario: Homepage after search interaction has no WCAG A/AA violations
  Given I am on the home page "/?locale=en-US"
  And the page title contains "Home TMDB"
  And the search input is visible
  When I fill the search input with "breaking"
  And I wait for search results
  And I run the axe-core accessibility check
  Then no WCAG A/AA violations should be detected
```

---

## Run Tests

```bash
# All accessibility tests
npx playwright test tests/acceptance/accessibility/

# Only accessibility tests by tag
npx playwright test -g @accessibility

# Accessibility + homepage
npx playwright test -g "(?=.*@accessibility)(?=.*@homepage)"

# With UI mode
npx playwright test tests/acceptance/accessibility/navigation.a11y.spec.js --ui

# Headed mode (visible browser)
npx playwright test tests/acceptance/accessibility/navigation.a11y.spec.js --headed
```

---

## Notes
- **Test File:** `tests/acceptance/accessibility/navigation.a11y.spec.js`
- **Test Cases:** TC-A11Y-001, TC-A11Y-002, TC-A11Y-003
- **Dependencies:** `@axe-core/playwright` must be installed
- **Viewport:** Desktop (1920x1080)
- **Tags:** `@accessibility`, `@homepage`, `@navigation`, `@search`, `@black-box`, `@regression`
- **Future Tests:** Movies page, TV Shows page, Detail pages, Manual screen reader testing, Manual keyboard navigation

---

## Traceability Matrix

| Test Case | Feature | Module | Type | Priority | Tags |
|-----------|---------|--------|------|----------|------|
| TC-A11Y-001 | F-A11Y | Homepage (/) | Automated (Black-Box) | High | @accessibility, @homepage, @black-box, @regression |
| TC-A11Y-002 | F-A11Y | Homepage + Navigation | Automated (Black-Box) | High | @accessibility, @homepage, @navigation, @black-box, @regression |
| TC-A11Y-003 | F-A11Y | Homepage + Search | Automated (Black-Box) | Medium | @accessibility, @homepage, @search, @black-box, @regression |

---

## Future Enhancements

### Planned Test Cases (Next Iteration)
- **TC-A11Y-004:** Movies page has no WCAG A/AA violations
- **TC-A11Y-005:** TV Shows page has no WCAG A/AA violations
- **TC-A11Y-006:** Movie detail page has no WCAG A/AA violations
- **TC-A11Y-007:** TV Show detail page has no WCAG A/AA violations

### Manual Testing (Later Phase)
- **TC-A11Y-M001:** Keyboard-only navigation works on homepage
- **TC-A11Y-M002:** Screen reader (NVDA/VoiceOver) can navigate homepage
- **TC-A11Y-M003:** Focus is visible and logical on all interactive elements
- **TC-A11Y-M004:** ARIA live regions announce dynamic content correctly
