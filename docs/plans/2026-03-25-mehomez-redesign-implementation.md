# Mehomez Portfolio Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local, premium multi-page portfolio for Mehomez that preserves all public content currently visible on `mehomez.de`.

**Architecture:** Capture a local WordPress snapshot first, normalize it into a clean content model, then render a static multi-page site with shared CSS and lightweight JavaScript. Use the homepage for the premium narrative layer and internal pages for exhaustive archives, filters, and detail views.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Python for content snapshot and verification scripts

---

### Task 1: Capture the public site snapshot

**Files:**
- Create: `scripts/fetch_mehomez_snapshot.py`
- Create: `data/source/wordpress-snapshot.json`
- Create: `tests/test_snapshot_counts.py`

**Step 1: Write the failing test**

```python
from pathlib import Path
import json
import unittest


class SnapshotCountsTest(unittest.TestCase):
    def test_snapshot_file_exists_with_required_collections(self):
        path = Path("data/source/wordpress-snapshot.json")
        self.assertTrue(path.exists())
        payload = json.loads(path.read_text(encoding="utf-8"))
        self.assertIn("pages", payload)
        self.assertIn("posts", payload)
        self.assertIn("categories", payload)
        self.assertIn("media", payload)
```

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_snapshot_counts -v`
Expected: `FAIL` because `data/source/wordpress-snapshot.json` does not exist yet.

**Step 3: Write minimal implementation**

Create a Python script that:

- fetches all pages from `https://mehomez.de/wp-json/wp/v2/pages?per_page=100`
- fetches all posts from the paginated posts endpoint
- fetches all categories from `https://mehomez.de/wp-json/wp/v2/categories?per_page=100`
- fetches all media from the paginated media endpoint
- stores the result in `data/source/wordpress-snapshot.json`
- stores the fetch date as `captured_at`

**Step 4: Run test to verify it passes**

Run: `python scripts/fetch_mehomez_snapshot.py`
Run: `python -m unittest tests.test_snapshot_counts -v`
Expected: `PASS`

**Step 5: Commit**

If Git exists:

```bash
git add scripts/fetch_mehomez_snapshot.py data/source/wordpress-snapshot.json tests/test_snapshot_counts.py
git commit -m "chore: capture mehomez wordpress snapshot"
```

If Git does not exist: skip and continue. This workspace is currently not a Git repository.

### Task 2: Normalize the content model

**Files:**
- Create: `scripts/build_mehomez_content.py`
- Create: `data/mehomez-content.json`
- Create: `tests/test_content_model.py`

**Step 1: Write the failing test**

```python
from pathlib import Path
import json
import unittest


class ContentModelTest(unittest.TestCase):
    def test_content_model_contains_required_sections(self):
        path = Path("data/mehomez-content.json")
        self.assertTrue(path.exists())
        payload = json.loads(path.read_text(encoding="utf-8"))
        for key in ("site", "artist", "works", "press", "parcours", "contact"):
            self.assertIn(key, payload)
```

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_content_model -v`
Expected: `FAIL` because `data/mehomez-content.json` does not exist yet.

**Step 3: Write minimal implementation**

Create a normalization script that:

- loads `data/source/wordpress-snapshot.json`
- maps categories to readable sections
- separates works, press items, parcours items, pages, and contact data
- extracts descriptions, techniques, dimensions, dates, slugs, image URLs, and category labels when available
- writes a single `data/mehomez-content.json`

**Step 4: Run test to verify it passes**

Run: `python scripts/build_mehomez_content.py`
Run: `python -m unittest tests.test_content_model -v`
Expected: `PASS`

**Step 5: Commit**

If Git exists:

```bash
git add scripts/build_mehomez_content.py data/mehomez-content.json tests/test_content_model.py
git commit -m "chore: normalize mehomez portfolio content"
```

If Git does not exist: skip and continue.

### Task 3: Scaffold the static site shell

**Files:**
- Create: `index.html`
- Create: `artiste.html`
- Create: `oeuvres.html`
- Create: `oeuvre.html`
- Create: `parcours.html`
- Create: `presse.html`
- Create: `article.html`
- Create: `contact.html`
- Create: `caca.css`
- Create: `app.js`

**Step 1: Write the failing smoke check**

```python
from pathlib import Path
import unittest


class StaticShellTest(unittest.TestCase):
    def test_required_html_files_exist(self):
        required = [
            "index.html",
            "artiste.html",
            "oeuvres.html",
            "oeuvre.html",
            "parcours.html",
            "presse.html",
            "article.html",
            "contact.html",
            "caca.css",
            "app.js",
        ]
        for file_name in required:
            self.assertTrue(Path(file_name).exists(), file_name)
```

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_static_shell -v`
Expected: `FAIL`

**Step 3: Write minimal implementation**

Create the HTML shells with:

- shared header
- navigation
- main content wrapper
- footer
- placeholder containers for dynamic rendering

Create:

- `caca.css` for global tokens, typography, layout, and theme variables
- `app.js` for shared navigation, theme toggle, and rendering helpers

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_static_shell -v`
Expected: `PASS`

**Step 5: Commit**

If Git exists:

```bash
git add index.html artiste.html oeuvres.html oeuvre.html parcours.html presse.html article.html contact.html caca.css app.js tests/test_static_shell.py
git commit -m "feat: scaffold static portfolio pages"
```

If Git does not exist: skip and continue.

### Task 4: Build the visual system

**Files:**
- Modify: `caca.css`
- Modify: `index.html`
- Modify: `app.js`

**Step 1: Write the failing check**

Add assertions to a CSS smoke test that look for:

- theme tokens for light mode
- theme tokens for dark mode
- typography tokens
- responsive breakpoints

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_theme_tokens -v`
Expected: `FAIL`

**Step 3: Write minimal implementation**

Implement:

- color tokens
- spacing scale
- type scale
- dark mode overrides
- textured backgrounds
- button styles
- cards, grids, and editorial block styles
- theme toggle behavior in `app.js`

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_theme_tokens -v`
Expected: `PASS`

**Step 5: Commit**

If Git exists:

```bash
git add caca.css index.html app.js tests/test_theme_tokens.py
git commit -m "feat: add editorial visual system and dark mode"
```

If Git does not exist: skip and continue.

### Task 5: Render the premium homepage

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `caca.css`

**Step 1: Write the failing check**

Add a homepage test that checks for the presence of:

- hero section
- featured works section
- artist teaser section
- parcours teaser section
- press teaser section

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_homepage_structure -v`
Expected: `FAIL`

**Step 3: Write minimal implementation**

Render the homepage using normalized data:

- hero with artist name and narrative statement
- featured works from recent or high-value pieces
- editorial blocks introducing major sections
- calls to action to explore archives

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_homepage_structure -v`
Expected: `PASS`

**Step 5: Commit**

If Git exists:

```bash
git add index.html app.js caca.css tests/test_homepage_structure.py
git commit -m "feat: build premium homepage"
```

If Git does not exist: skip and continue.

### Task 6: Render artist and contact pages

**Files:**
- Modify: `artiste.html`
- Modify: `contact.html`
- Modify: `app.js`
- Modify: `caca.css`

**Step 1: Write the failing check**

Add tests for:

- artist biography container
- artist approach or presentation block
- contact details section
- contact links or email block

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_artist_contact_pages -v`
Expected: `FAIL`

**Step 3: Write minimal implementation**

Render:

- artist presentation from page content
- supporting visual block
- contact details sourced from the snapshot

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_artist_contact_pages -v`
Expected: `PASS`

**Step 5: Commit**

If Git exists:

```bash
git add artiste.html contact.html app.js caca.css tests/test_artist_contact_pages.py
git commit -m "feat: render artist and contact pages"
```

If Git does not exist: skip and continue.

### Task 7: Render the works archive and detail page

**Files:**
- Modify: `oeuvres.html`
- Modify: `oeuvre.html`
- Modify: `app.js`
- Modify: `caca.css`

**Step 1: Write the failing check**

Add tests for:

- works archive container
- year filter
- type filter
- work detail metadata block
- image container

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_works_pages -v`
Expected: `FAIL`

**Step 3: Write minimal implementation**

Render:

- complete works archive from normalized data
- filters by type and year
- cards linked by slug
- detail page showing title, year, categories, description, technique, dimensions, and image URLs

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_works_pages -v`
Expected: `PASS`

**Step 5: Commit**

If Git exists:

```bash
git add oeuvres.html oeuvre.html app.js caca.css tests/test_works_pages.py
git commit -m "feat: render works archive and detail pages"
```

If Git does not exist: skip and continue.

### Task 8: Render parcours and press archives

**Files:**
- Modify: `parcours.html`
- Modify: `presse.html`
- Modify: `article.html`
- Modify: `app.js`
- Modify: `caca.css`

**Step 1: Write the failing check**

Add tests for:

- parcours timeline container
- press archive list
- press detail page container
- source and date metadata

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_parcours_press_pages -v`
Expected: `FAIL`

**Step 3: Write minimal implementation**

Render:

- parcours archive grouped or sorted by date
- press archive cards with source/date/title
- article detail page with media and preserved text

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_parcours_press_pages -v`
Expected: `PASS`

**Step 5: Commit**

If Git exists:

```bash
git add parcours.html presse.html article.html app.js caca.css tests/test_parcours_press_pages.py
git commit -m "feat: render parcours and press archives"
```

If Git does not exist: skip and continue.

### Task 9: Verify content preservation and responsive quality

**Files:**
- Create: `scripts/verify_content_integrity.py`
- Create: `tests/test_content_integrity.py`
- Modify: `data/mehomez-content.json`

**Step 1: Write the failing test**

```python
import json
from pathlib import Path
import unittest


class ContentIntegrityTest(unittest.TestCase):
    def test_expected_sections_are_not_empty(self):
        payload = json.loads(Path("data/mehomez-content.json").read_text(encoding="utf-8"))
        self.assertGreater(len(payload["works"]), 0)
        self.assertGreater(len(payload["press"]), 0)
        self.assertGreater(len(payload["parcours"]), 0)
```

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_content_integrity -v`
Expected: `FAIL` until all sections are fully populated.

**Step 3: Write minimal implementation**

Create an integrity script that:

- compares local counts against the snapshot
- checks for missing slugs
- reports empty image sets
- reports entries missing key metadata

Also run a manual responsive review using a local server.

**Step 4: Run test to verify it passes**

Run: `python scripts/verify_content_integrity.py`
Run: `python -m unittest tests.test_content_integrity -v`
Expected: `PASS`

Manual review:

- Run: `python -m http.server 8080`
- Open: `http://localhost:8080`
- Check desktop and narrow mobile width

**Step 5: Commit**

If Git exists:

```bash
git add scripts/verify_content_integrity.py tests/test_content_integrity.py data/mehomez-content.json
git commit -m "test: verify portfolio content integrity and responsiveness"
```

If Git does not exist: skip and continue.

### Task 10: Polish copy and final visual refinement

**Files:**
- Modify: `index.html`
- Modify: `artiste.html`
- Modify: `oeuvres.html`
- Modify: `parcours.html`
- Modify: `presse.html`
- Modify: `contact.html`
- Modify: `caca.css`
- Modify: `app.js`

**Step 1: Write the failing check**

Add a final smoke test ensuring:

- no page shell is empty
- the theme toggle renders
- at least one navigation link is active per page

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_final_smoke -v`
Expected: `FAIL` until final wiring is complete.

**Step 3: Write minimal implementation**

Polish:

- headings
- section introductions
- spacing rhythm
- hover and focus states
- dark mode refinements
- mobile spacing and stacking

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_final_smoke -v`
Expected: `PASS`

**Step 5: Commit**

If Git exists:

```bash
git add index.html artiste.html oeuvres.html parcours.html presse.html contact.html caca.css app.js tests/test_final_smoke.py
git commit -m "feat: polish mehomez portfolio redesign"
```

If Git does not exist: skip and continue.
