# Usability Testing Checklist

**Goal:** This checklist supports manual usability reviews of the TMDB SvelteKit frontend. It covers discoverability, navigation, search, error handling, responsive behavior, and localization. All checks are performed manually — no automation tooling required.

> Usability testing is distinct from functional testing. The question is not whether a feature works, but whether a real user can find, understand, and complete it without friction.

---

## Roles and Responsibilities

| Role | Responsibilities |
|---|---|
| **Test Manager** | Define scope, select scenarios, prioritize findings |
| **Usability Tester** | Execute manual scenarios, document observations and friction points |
| **Developer** | Assess findings, implement improvements, confirm resolution |

> In a solo project, all roles are fulfilled by the same person.

---

## 1. Prepare the Session

- [ ] Define the goal of this session (e.g. full review, focused on search, focused on mobile)
- [ ] Confirm the environment: local dev server or production preview
- [ ] Select browsers: at minimum Chromium desktop and a mobile viewport (375px)
- [ ] Confirm the active locale before starting (switch via the language selector in the header)
- [ ] Clear browser state (local storage, session) to simulate a first-time visitor where relevant

---

## 2. Homepage and First Impression

- [ ] The page purpose is clear within 5 seconds without reading any text (visual scan only)
- [ ] Trending movies and TV shows are visible without scrolling on desktop
- [ ] The page loads and becomes interactive without a noticeable delay
- [ ] No broken images or placeholder text visible on initial load
- [ ] The language selector is discoverable without guidance

---

## 3. Navigation and Orientation

- [ ] The main navigation clearly distinguishes between Movies and TV Shows sections
- [ ] The active page is visually indicated in the navigation
- [ ] The browser back button behaves as expected (returns to the previous page, not the top of the list)
- [ ] After navigating away and returning to a paginated list, the last visited page is restored
- [ ] Breadcrumb or back navigation on detail pages is understandable and usable
- [ ] There is no dead end — every page offers a clear path forward or back

---

## 4. Typeahead Search

- [ ] The search input is discoverable from any page
- [ ] Results appear within a reasonable time after typing (no perceived freeze)
- [ ] Results are clearly labeled (movie vs. TV show is distinguishable)
- [ ] Clicking a result navigates to the correct detail page in the currently active locale
- [ ] Clearing the search input removes the results without page reload
- [ ] Typing fewer than four characters shows no results or an appropriate hint (no broken state)
- [ ] Searching with a very long string does not break the layout
- [ ] After switching language while a search term is active, results reload in the new language automatically

---

## 5. Paginated Lists

- [ ] The "load more" or pagination control is visible without scrolling past the content
- [ ] Loading additional items does not cause page scroll to reset to the top
- [ ] Duplicate entries are not visible after loading more items
- [ ] The current page position is clear (page indicator, item count, or equivalent)
- [ ] Returning from a detail page restores the correct position in the list

---

## 6. Detail Pages

- [ ] Movie and TV show title, description, and key metadata are immediately visible
- [ ] The cast section is present and legible
- [ ] Missing images use a clear fallback (no broken image icons)
- [ ] Missing text fields use a clear fallback (no empty boxes or `undefined`)
- [ ] Streaming providers are displayed with the JustWatch attribution label
- [ ] Production information is readable and not visually cluttered

---

## 7. Error Handling

- [ ] If the TMDB API returns an error, an understandable error message is displayed (not a blank page)
- [ ] The error dialog clearly explains what went wrong and offers a recovery action (retry or navigate away)
- [ ] A broken or invalid URL (e.g. `/movies/9999999`) results in a graceful error page, not a crash
- [ ] Network errors (simulate by disabling network in DevTools) are handled visibly

---

## 8. Localization

- [ ] Switching language updates all UI labels and navigation items immediately
- [ ] Switching language updates movie and TV show titles and descriptions on detail pages
- [ ] Date formats match the selected locale
- [ ] Rating formats match the selected locale (see `src/lib/i18n/ratings.json`)
- [ ] No untranslated keys (raw `i18n.key` strings) are visible after switching language
- [ ] The language preference is preserved when navigating between pages

---

## 9. Responsive Behavior (Mobile: 375px viewport)

- [ ] All content is readable without horizontal scrolling
- [ ] The navigation is usable on a narrow screen (no overflow or hidden items)
- [ ] Cards and images scale correctly and maintain aspect ratio
- [ ] The typeahead search is usable on a touch device (keyboard does not obscure results)
- [ ] Touch targets (buttons, links, cards) are large enough to tap without precision
- [ ] Detail pages are fully readable in a single-column layout

---

## 10. Finding Template

| Field | Content |
|---|---|
| ID | Unique identifier, e.g. `UX-012` |
| Page / Flow | Affected route and user scenario |
| Observation | What the tester observed (neutral, not interpreted) |
| Expected Behavior | What a smooth, frictionless experience would look like |
| Severity | Blocker, High, Medium, Low |
| Device / Viewport | Browser, screen width, input method |
| Screenshot / Notes | Attach if helpful |
| Fix Suggestion | Optional — concrete improvement idea |
| Status | Open, In Progress, Resolved |
