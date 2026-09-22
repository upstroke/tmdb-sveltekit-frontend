# TabGroupe Accessibility Test Plan

## Feature: TabGroupe Accessibility Compliance

The TabGroupe component follows WAI-ARIA Authoring Practices for tabs and is tested on the TV detail page to verify keyboard accessibility, visible state changes, and automated accessibility checks with `checkA11y`.

---

## Scenario 1: Initial detail-page accessibility

**Given** the TV detail page with TabGroupe is rendered  
**Then** the tablist should be visible  
**Then** the first active tabpanel should be visible  
**Then** the page should have no automatically detected WCAG A/AA violations via `checkA11y`

---

## Scenario 2: ARIA roles are correctly applied

**Given** the TabGroupe component is rendered  
**Then** the tablist container should have `role="tablist"`  
**Then** each tab button should have `role="tab"`  
**Then** each panel should have `role="tabpanel"`

---

## Scenario 3: ARIA attributes are correctly managed

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

## Scenario 4: Accessibility after season-tab change

**Given** the TV detail page contains more than one season tab  
**When** the user activates another season tab  
**Then** the new tab should become selected  
**Then** the related tabpanel should become visible  
**Then** the resulting state should have no automatically detected WCAG A/AA violations via `checkA11y`

---

## Scenario 5: Focus management

**Given** the tablist is focused  
**When** a user presses `ArrowRight`  
**Then** focus should move to the next tab  
**Then** the newly focused tab should become selected  
*(Automated via Playwright)*

**Given** an episode list is focused  
**When** a user presses arrow keys (`ArrowDown`, `ArrowUp`, `Home`, `End`)  
**Then** focus should move between episodes  
**And** focus should never leave the episode list unexpectedly  
*(Automated via Playwright)*

**Given** any element is focused  
**When** a user presses Tab  
**Then** focus should follow natural tab order  
**And** no focus trap should occur

---

## Scenario 6: Screen reader support

**Given** the tablist is rendered  
**Then** it should have an accessible label via `aria-label` or `aria-labelledby`  
**Then** each tab should have accessible text content  
**Then** episode information should be exposed in a structured way for assistive technologies

---

## Scenario 7: Focus indicators

**Given** any interactive element is focused  
**Then** a visible focus indicator should be present  
**Then** the focus indicator should have sufficient contrast

---

## Acceptance Criteria

1. The TV detail page with TabGroupe passes automated `checkA11y` checks in its initial state.
2. A changed season-tab state also passes automated `checkA11y` checks.
3. All WAI-ARIA roles and attributes are correctly applied to tabs and tabpanels.
4. Keyboard navigation works for tabs and episode lists without focus loss or trapping.
5. Screen readers can announce tab states and structured episode content correctly.
6. Visible focus indicators are present on interactive elements.
