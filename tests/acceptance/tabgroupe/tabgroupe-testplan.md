# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB SvelteKit Frontend
- **Module:** TabGroupe (TV Show Season Selector)
- **Version:** 1.0
- **Date:** 2026-09-17

### 2. Introduction

The purpose of this test plan is to validate the TabGroupe component from a user's perspective. The tests ensure that season selection via tab buttons works correctly, with proper ARIA attributes indicating the selected state.

### 3. Test Items

- `TabGroupe.svelte` — Season selector component with tab buttons
- Tab selection behavior (Season 1, 2, 3)
- ARIA attributes (`aria-selected`)
- Default selection on page load

### 4. Features to be tested

- Season 1 is selected by default on page load
- Clicking Season 2 tab selects Season 2
- Clicking Season 3 tab selects Season 3
- `aria-selected` attribute updates correctly to `"true"` for selected tab
- `aria-selected` attribute is `"false"` for unselected tabs

### 5. Features not to be tested

- Keyboard navigation (covered in separate accessibility test plan)
- Multi-click navigation (e.g., Season 2 → Season 1, currently failing)
- Episode list content (separate component tests)
- Watch providers / streaming info (separate tests)

### 6. Approach

- **Tool:** Playwright
- **Syntax:** Gherkin for user stories
- **Browser:** Chromium (default)
- **Viewport:** Desktop (1920x1080)
- **Selectors:** Role-based (`getByRole('tablist')`, `getByRole('tab')`)
- **Test Design Technique:** Decision Table Testing (ISTQB Black-Box)
- **Tags:** `@tabgroupe`, `@desktop`, `@black-box`, `@regression`, `@a11y`
- **Test File:** `tests/acceptance/tabgroupe/tabgroupe.spec.js`

### 7. Item Pass/Fail Criteria

- **Pass:** All test steps successful, no errors in console log, `aria-selected` attribute correct
- **Fail:** At least one step failed or assertion failed

---

## Decision Table (Test Coverage Matrix)

| Test Variant / Feature | Desktop (1920x1080) |
|------------------------|---------------------|
| **Season 1 selected by default** | ✅ TC-TAB-001 |
| **Click Season 2 selects it** | ✅ TC-TAB-002 |
| **Click Season 3 selects it** | ✅ TC-TAB-003 |

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Test case implemented for this viewport |
| ❌ | Not applicable / not tested |

### Rationale

- **Season 1 selected by default:** Default state is tested independently on page load.
- **Click Season 2/3 selects it:** Single-click tab selection is verified for each season.
- **Multi-click navigation:** Currently failing (Season 2 → Season 1), under investigation.

---

## Derived Test Cases

### TC-TAB-001: Season 1 is selected by default

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop (`/tv-shows/113962`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@tabgroupe`, `@desktop`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**

- App running on `localhost:4173`
- Browser: Chromium, desktop viewport (1920x1080)
- TV Show: Lioness (ID: 113962) with 3 seasons

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/tv-shows/113962?locale=en-US` | TV show detail page is displayed |
| 2 | Locate tablist | Tablist with 3 tabs is visible |
| 3 | Verify first tab | First tab (Season 1) has `aria-selected="true"` |
| 4 | Verify other tabs | Season 2 and Season 3 tabs have `aria-selected="false"` |

**Pass/Fail Criteria:**

- All steps successful
- No errors in browser console log
- Season 1 is selected by default
- ARIA attributes are correct

**Test File:** `tests/acceptance/tabgroupe/tabgroupe.spec.js`

---

### TC-TAB-002: Click Season 2 selects it

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop (`/tv-shows/113962`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@tabgroupe`, `@desktop`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**

- App running on `localhost:4173`
- Browser: Chromium, desktop viewport (1920x1080)
- TV Show: Lioness (ID: 113962) with 3 seasons

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/tv-shows/113962?locale=en-US` | TV show detail page is displayed |
| 2 | Locate tablist | Tablist with 3 tabs is visible |
| 3 | Click Season 2 tab | Season 2 tab is clicked |
| 4 | Wait for update | `aria-selected` attribute updates |
| 5 | Verify Season 2 tab | Season 2 tab has `aria-selected="true"` |
| 6 | Verify other tabs | Season 1 and Season 3 tabs have `aria-selected="false"` |

**Pass/Fail Criteria:**

- All steps successful
- No errors in browser console log
- Season 2 is selected after click
- ARIA attributes are correct

**Test File:** `tests/acceptance/tabgroupe/tabgroupe.spec.js`

---

### TC-TAB-003: Click Season 3 selects it

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop (`/tv-shows/113962`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@tabgroupe`, `@desktop`, `@black-box`, `@regression`, `@a11y`

**Pre-Conditions:**

- App running on `localhost:4173`
- Browser: Chromium, desktop viewport (1920x1080)
- TV Show: Lioness (ID: 113962) with 3 seasons

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/tv-shows/113962?locale=en-US` | TV show detail page is displayed |
| 2 | Locate tablist | Tablist with 3 tabs is visible |
| 3 | Click Season 3 tab | Season 3 tab is clicked |
| 4 | Wait for update | `aria-selected` attribute updates |
| 5 | Verify Season 3 tab | Season 3 tab has `aria-selected="true"` |
| 6 | Verify other tabs | Season 1 and Season 2 tabs have `aria-selected="false"` |

**Pass/Fail Criteria:**

- All steps successful
- No errors in browser console log
- Season 3 is selected after click
- ARIA attributes are correct

**Test File:** `tests/acceptance/tabgroupe/tabgroupe.spec.js`

---

## Gherkin User Stories

### Feature: TabGroupe Season Selector (F-TAB)

**As** a visitor of the TMDB website  
**I want** to select different seasons of a TV show  
**So that** I can view episodes for each season


Background:
Given the app is available in the browser
And I am on the TV show detail page for "Lioness" (ID: 113962)

@TC-TAB-001
Scenario: Season 1 is selected by default
Given I navigate to "/tv-shows/113962?locale=en-US"
Then the tablist should contain 3 tabs
And the first tab (Season 1) should have aria-selected="true"
And the second tab (Season 2) should have aria-selected="false"
And the third tab (Season 3) should have aria-selected="false"

@TC-TAB-002
Scenario: Click Season 2 selects it
Given I navigate to "/tv-shows/113962?locale=en-US"
When I click the "Season 2" tab
Then the "Season 2" tab should have aria-selected="true"
And the "Season 1" tab should have aria-selected="false"
And the "Season 3" tab should have aria-selected="false"

@TC-TAB-003
Scenario: Click Season 3 selects it
Given I navigate to "/tv-shows/113962?locale=en-US"
When I click the "Season 3" tab
Then the "Season 3" tab should have aria-selected="true"
And the "Season 1" tab should have aria-selected="false"
And the "Season 2" tab should have aria-selected="false"
