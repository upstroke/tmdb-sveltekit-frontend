# Acceptance Tests

## Test Plan

### 1. Test Plan Identifier
- **Projekt:** TMDB SvelteKit Frontend
- **Modul:** Hauptnavigation
- **Version:** 1.0
- **Datum:** 2026-09-04

### 2. Introduction
Zweck dieses Testplans ist die Validierung der Hauptnavigation aus User-Sicht. Die Tests stellen sicher, dass die Navigation zwischen den Hauptseiten (Home, Movies, TV Shows) auf Desktop und mobilen Geräten korrekt funktioniert.

### 3. Test Items
- `HeaderMain.svelte` — Globale Kopfzeile mit Navigation
- Navigation Routes: `/`, `/movies`, `/tv-shows`
- Mobile Menü (Burger-Icon)
- Aktiver Link-Status (`aria-current="page"`)

### 4. Features to be tested
- Navigation zwischen Hauptseiten (Desktop)
- Mobile Menü öffnen/schliessen (Burger)
- Navigation im Mobile-Modus
- Korrekte Seitentitel pro Route
- Aktiver Link visuell hervorgehoben

### 5. Features not to be tested
- LanguageSwitcher (separater Test geplant)
- TypeHeadSearch (separater Test geplant)
- Detailseiten für Filme/Serien (spä¬¨ter)
- Pagination / Load More (spä¬¨ter)

### 6. Approach
- **Tool:** Playwright
- **Syntax:** Gherkin für User Stories
- **Browser:** Chromium (default)
- **Viewports:** Desktop (default) + Mobile (375x667)
- **Selektoren:** CSS-ID-basiert (`#home`, `#movies`, `#tvshows`, `#menu-toggle`)

### 7. Item Pass/Fail Criteria
- **Pass:** Alle Test Steps erfolgreich, keine Errors im Console Log, URL + Title + aria-current korrekt
- **Fail:** Mindestens ein Step fehlerhaft oder Assertion failed

---

## Gherkin User Stories

### Feature: Hauptnavigation (F-NAV)

**Als** Besucher der TMDB-Website  
**Mö¬¨¬chte** ich zwischen den Hauptseiten (Home, Movies, TV Shows) navigieren können  
**Damit** ich Filme und Serien entdecken kann

```
Background:
  Given die App ist im Browser verfügbar

@TC-NAV-001
Scenario: Desktop-Navigation funktioniert
  Given ich bin auf der Startseite "/"
  When ich auf den "Movies" Navigationslink klicke
  Then sollte die URL "/movies" sein
  And der Seitentitel sollte "Movies TMDB" enthalten
  And der "Movies" Link sollte als aktiv markiert sein (aria-current="page")

  When ich auf den "TV Shows" Navigationslink klicke
  Then sollte die URL "/tv-shows" sein
  And der Seitentitel sollte "TV TMDB" enthalten
  And der "TV Shows" Link sollte als aktiv markiert sein

  When ich auf den "Home" Navigationslink klicke
  Then sollte die URL "/" sein
  And der Seitentitel sollte "Home TMDB" enthalten
  And der "Home" Link sollte als aktiv markiert sein

@TC-NAV-002
Scenario: Mobile-Navigation funktioniert
  Given ich bin auf der Startseite "/"
  And ich habe eine mobile Bildschirmgrö¬¬¬ß¬ö¬¬¬e (375x667)
  When ich das Burger-Menö¬¬¬u öffne (klicke auf #menu-toggle)
  And ich auf den "Movies" Navigationslink klicke
  Then sollte die URL "/movies" sein
  And der Seitentitel sollte "Movies TMDB" enthalten

  When ich das Burger-Menö¬¬¬u erneut öffne
  And ich auf den "TV Shows" Navigationslink klicke
  Then sollte die URL "/tv-shows" sein
  And der Seitentitel sollte "TV TMDB" enthalten
```

---

## Test Case Specifications

### TC-NAV-001: Desktop-Navigation funktioniert

**Pre-Conditions:**
- App läuft auf `localhost:4173`
- Browser: Chromium, Desktop-Viewport

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
- Alle Steps erfolgreich
- Keine Errors im Browser Console Log

---

### TC-NAV-002: Mobile-Navigation funktioniert

**Pre-Conditions:**
- App läuft auf `localhost:4173`
- Browser: Chromium, Viewport: 375x667 (Mobile)

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
- Alle Steps erfolgreich
- Mobile Menü öffnet/schliesst korrekt
- Keine Errors im Browser Console Log

---

## Tests ausfuhren

```bash
# Alle Acceptance Tests
just test-acceptance

# Nur Navigation-Tests
npx playwright test tests/acceptance/navigation.spec.js
```
