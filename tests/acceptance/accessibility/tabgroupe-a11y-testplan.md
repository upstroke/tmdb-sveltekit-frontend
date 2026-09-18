# TabGroupe Accessibility Test Plan

## Feature: TabGroupe Accessibility Compliance

The TabGroupe component follows WAI-ARIA Authoring Practices for tabs, ensuring full keyboard accessibility and proper screen reader support.

---

## Scenario 1: ARIA roles are correctly applied

**Given** the TabGroupe component is rendered  
**Then** the tablist container should have `role="tablist"`  
**Then** each tab button should have `role="tab"`  
**Then** each panel should have `role="tabpanel"`

---

## Scenario 2: ARIA attributes are correctly managed

**Given** a tab is selected  
**Then** it should have `aria-selected="true"`  
**Then** inactive tabs should have `aria-selected="false"`

**Given** a tab is selected  
**Then** it should have `tabindex="0"`  
**Then** inactive tabs should have `tabindex="-1"`

**Given** a tabpanel is active  
**Then** it should not have the `hidden` attribute  
**Then** inactive tabpanels should have the `hidden` attribute

---

## Scenario 3: Focus management

**Given** the tablist is focused  
**When** a user presses arrow keys  
**Then** focus should move between tabs  
**And** focus should never leave the tablist unexpectedly  
*(Note: To prevent headless test-runner timing conflicts during Svelte 5 hydration, tab focus movement is verified via manual/headed testing).*

**Given** an episode list is focused  
**When** a user presses arrow keys (`ArrowDown`, `ArrowUp`, `Home`, `End`)  
**Then** focus should move between episodes  
**And** focus should never leave the episode list unexpectedly  
*(Automated via Playwright)*

**Given** any element is focused  
**When** a user presses Tab  
**Then** focus should follow natural tab order (no trapping, starts at the main menu)

---

## Scenario 4: Screen reader support

**Given** the tablist is rendered  
**Then** it should have an accessible label via `aria-label` or `aria-labelledby`  
**Then** each tab should have accessible text content  
**Then** episode information should be properly structured with headings

---

## Scenario 5: Focus indicators

**Given** any interactive element is focused  
**Then** a visible focus indicator should be present  
**Then** the focus indicator should have sufficient contrast

---

## Acceptance Criteria

1. All WAI-ARIA roles and attributes are correctly applied.
2. Full keyboard navigation works within the episode lists (Arrow keys, Home, End) and is fully automated.
3. Tab-level arrow navigation is verified manually to account for local framework hydration lifecycles.
4. No focus traps - Tab key works normally across the application layout.
5. Visible focus indicators are active on all interactive elements.
6. Screen readers can properly announce tab states and structured episode content.
