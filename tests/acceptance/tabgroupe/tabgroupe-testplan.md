# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB SvelteKit Frontend
- **Module:** TabGroupe (TV Show Season Selector)
- **Version:** 1.1
- **Date:** 2026-09-18

### 2. Introduction

The purpose of this test plan is to validate the TabGroupe component from a user's perspective. The tests ensure that season selection, episode display, and keyboard interaction work correctly on the TV show detail page, with proper ARIA attributes indicating the selected state.

### 3. Test Items

- `TabGroupe.svelte` — Season selector component with tab buttons
- Tab selection behavior (Season 1, 2, 3)
- Season episode display
- Empty-season overview fallback
- ARIA attributes (`aria-selected`, `tabindex`)
- Default selection on page load
- Keyboard navigation between season tabs

### 4. Features to be tested

- Season 1 is selected by default on page load
- Clicking Season 2 tab selects Season 2
- Clicking Season 3 tab selects Season 3
- `aria-selected` attribute updates correctly to `"true"` for the selected tab
- `aria-selected` attribute is `"false"` for unselected tabs
- Episodes of the selected season are displayed
- Switching a season updates the visible episode list
- A season without episodes displays its overview as fallback content
- Keyboard navigation between tabs works with ArrowLeft, ArrowRight, Home, and End
- Keyboard focus can leave the tablist with Tab

### 5. Features not to be tested

- Detailed roving-tabindex implementation is covered by component and accessibility tests
- Episode keyboard navigation is covered by component and accessibility tests
- Watch providers and streaming information are covered by separate tests
- TMDB API mapping and season loading failures are covered by unit tests

### 6. Approach

- **Tool:** Playwright
- **Syntax:** Gherkin for user stories
- **Browser:** Chromium (default)
- **Viewport:** Desktop (1920x1080)
- **Selectors:** Role-based (`getByRole('tablist')`, `getByRole('tab')`, `getByRole('tabpanel')`)
- **Test Design Technique:** Decision Table Testing (ISTQB Black-Box)
- **Tags:** `@tabgroupe`, `@desktop`, `@black-box`, `@regression`, `@a11y`
- **Test File:** `tests/acceptance/tabgroupe/tabgroupe.spec.js`

### 7. Item Pass/Fail Criteria

- **Pass:** All test steps are successful, no errors occur in the browser console, and the expected selected state and visible content are present.
- **Fail:** At least one test step or assertion fails.

---

## Decision Table (Test Coverage Matrix)

| Test Variant / Feature                              | Desktop (1920x1080) |
|-----------------------------------------------------|---------------------|
| **Season 1 selected by default**                    | ✅ TC-TAB-001       |
| **Click Season 2 selects it**                       | ✅ TC-TAB-002       |
| **Click Season 3 selects it**                       | ✅ TC-TAB-003       |
| **Episodes of Season 1 visible by default**         | ✅ TC-TAB-004       |
| **Click Season 2 updates visible episodes**         | ✅ TC-TAB-005       |
| **Season without episodes shows overview fallback** | ✅ TC-TAB-006       |
| **Tab leaves the tablist**                          | ✅ TC-TAB-007       |

### Legend

| Symbol | Meaning                                            |
|--------|----------------------------------------------------|
| ✅     | Test case implemented or planned for this viewport |

### Rationale

- Default state and direct click selection validate the primary mouse/touch interaction.
- Episode rendering validates that a selected tab exposes the matching content.
- The empty-season fallback prevents an unexplained blank panel.
- Keyboard cases validate user-visible tab behavior; lower-level focus-management details remain covered in component and accessibility tests.

---

## Derived Test Cases

### TC-TAB-001: Season 1 is selected by default

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop (`/tv-shows/113962`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@tabgroupe`, `@desktop`, `@black-box`, `@regression`, `@a11y`

| Step | Action                                      | Expected Result                                         |
|------|---------------------------------------------|---------------------------------------------------------|
| 1    | Navigate to `/tv-shows/113962?locale=en-US` | TV show detail page is displayed                        |
| 2    | Locate tablist                              | Tablist with 3 tabs is visible                          |
| 3    | Verify first tab                            | First tab (Season 1) has `aria-selected="true"`         |
| 4    | Verify other tabs                           | Season 2 and Season 3 tabs have `aria-selected="false"` |

### TC-TAB-002: Click Season 2 selects it

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop (`/tv-shows/113962`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@tabgroupe`, `@desktop`, `@black-box`, `@regression`, `@a11y`

| Step | Action                              | Expected Result                                    |
|------|-------------------------------------|----------------------------------------------------|
| 1    | Navigate to the TV show detail page | Season 1 is selected                               |
| 2    | Click Season 2 tab                  | Tab selection updates                              |
| 3    | Verify Season 2                     | Season 2 has `aria-selected="true"`                |
| 4    | Verify other tabs                   | Season 1 and Season 3 have `aria-selected="false"` |

### TC-TAB-003: Click Season 3 selects it

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop (`/tv-shows/113962`)  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@tabgroupe`, `@desktop`, `@black-box`, `@regression`, `@a11y`

| Step | Action                              | Expected Result                                    |
|------|-------------------------------------|----------------------------------------------------|
| 1    | Navigate to the TV show detail page | Season 1 is selected                               |
| 2    | Click Season 3 tab                  | Tab selection updates                              |
| 3    | Verify Season 3                     | Season 3 has `aria-selected="true"`                |
| 4    | Verify other tabs                   | Season 1 and Season 2 have `aria-selected="false"` |

### TC-TAB-004: Episodes of Season 1 are visible by default

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop (`/tv-shows/113962`)  
**Priority:** High  
**Type:** Functional (Black-Box)

| Step | Action                                      | Expected Result                                       |
|------|---------------------------------------------|-------------------------------------------------------|
| 1    | Navigate to `/tv-shows/113962?locale=en-US` | TV show detail page is displayed                      |
| 2    | Locate the tablist                          | Three season tabs are visible                         |
| 3    | Verify the default tab                      | Season 1 has `aria-selected="true"`                   |
| 4    | Locate the active tabpanel                  | The Season 1 panel is visible                         |
| 5    | Verify episode content                      | “Sacrificial Soldiers” is visible in the active panel |

### TC-TAB-005: Selecting a season updates episodes

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop (`/tv-shows/113962`)  
**Priority:** High  
**Type:** Functional (Black-Box)

| Step | Action                              | Expected Result                                           |
|------|-------------------------------------|-----------------------------------------------------------|
| 1    | Navigate to the TV show detail page | Season 1 is selected                                      |
| 2    | Click the Season 2 tab              | The tab selection updates                                 |
| 3    | Verify Season 2                     | Season 2 has `aria-selected="true"`                       |
| 4    | Verify the active panel             | The Season 2 panel is visible                             |
| 5    | Verify episode content              | “Beware the Old Soldier” is visible                       |
| 6    | Verify old content is hidden        | “Sacrificial Soldiers” is not visible in the active panel |

### TC-TAB-006: Empty season shows overview fallback

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop  
**Priority:** Medium  
**Type:** Functional (Black-Box)

| Step | Action                                                 | Expected Result                                 |
|------|--------------------------------------------------------|-------------------------------------------------|
| 1    | Navigate to a TV show detail page with an empty season | Detail page is displayed                        |
| 2    | Select the empty season                                | The tab becomes selected                        |
| 3    | Verify fallback content                                | The season overview is visible                  |
| 4    | Verify episode list                                    | No episode list is rendered in the active panel |


### TC-TAB-007: Tab does not trap focus

**Feature:** F-TAB (TabGroupe Season Selector)  
**Module:** Desktop (`/tv-shows/113962`)  
**Priority:** Medium  
**Type:** Accessibility

| Step | Action             | Expected Result                      |
|------|--------------------|--------------------------------------|
| 1    | Focus a season tab | The tab receives keyboard focus      |
| 2    | Press Tab          | Focus leaves the tablist             |
| 3    | Verify state       | No season tab retains keyboard focus |

---

## Gherkin User Stories

### Feature: TabGroupe Season Selector (F-TAB)

**As** a visitor of the TMDB website  
**I want** to select different seasons of a TV show  
**So that** I can view the relevant episodes and season information

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

@TC-TAB-004
Scenario: Episodes of the initially selected season are visible
  Given I navigate to "/tv-shows/113962?locale=en-US"
  Then the "Season 1" tab should have aria-selected="true"
  And the active season panel should show "Sacrificial Soldiers"

@TC-TAB-005
Scenario: Selecting another season updates the displayed episodes
  Given I navigate to "/tv-shows/113962?locale=en-US"
  When I click the "Season 2" tab
  Then the "Season 2" tab should have aria-selected="true"
  And the active season panel should show "Beware the Old Soldier"
  And the active season panel should not show "Sacrificial Soldiers"

@TC-TAB-006
Scenario: An empty season shows its overview
  Given I navigate to a TV show with an empty season
  When I click the empty season tab
  Then the active season panel should show the season overview
  And the active season panel should not contain an episode list

@TC-TAB-007
Scenario: Tab leaves the season selector
  Given I navigate to "/tv-shows/113962?locale=en-US"
  And the "Season 1" tab has keyboard focus
  When I press "Tab"
  Then no season tab should have keyboard focus
