# Flixster Component Architecture

## File Structure

```
src/
├── components/
│   ├── Header/
│   │   ├── Header.jsx
│   │   └── Header.css
│   ├── SearchBar/
│   │   ├── SearchBar.jsx
│   │   └── SearchBar.css
│   ├── SortControl/
│   │   ├── SortControl.jsx
│   │   └── SortControl.css
│   ├── MovieList/
│   │   ├── MovieList.jsx
│   │   └── MovieList.css
│   ├── MovieCard/
│   │   ├── MovieCard.jsx
│   │   └── MovieCard.css
│   ├── MovieModal/
│   │   ├── MovieModal.jsx
│   │   └── MovieModal.css
│   └── Footer/
│       ├── Footer.jsx
│       └── Footer.css
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## Environment Variables

API keys are stored in a `.env` file at the project root (gitignored). Vite exposes them via `import.meta.env`.

```
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Access in code: `import.meta.env.VITE_TMDB_API_KEY`

## Component Hierarchy

```
App
├── Header
├── SearchBar
├── SortControl
├── MovieList
│   └── MovieCard (repeated)
├── MovieModal (conditional)
└── Footer
```

## Component Definitions

### App

- **Responsibility:** Top-level container that manages global application state, handles API calls, and orchestrates all child components.
- **Renders:** Header, SearchBar, SortControl, MovieList, MovieModal (conditionally), Footer, loading skeleton, error message with retry
- **Props:** None (root component)
- **State:**
  - `movies` — array of movie objects currently displayed
  - `searchQuery` — current search/debounced query string
  - `sortBy` — current sort criteria (e.g., "title", "rating", "release_date")
  - `selectedMovie` — full movie detail object for the modal (null when closed)
  - `page` — current page number for pagination
  - `totalPages` — total pages from API response
  - `isLoading` — boolean for initial/page fetch loading state
  - `isModalLoading` — boolean for movie detail fetch loading state
  - `error` — error message string (null when no error)
  - `isSearchMode` — boolean tracking whether showing search results or now playing

---

### Header

- **Responsibility:** Displays the app branding/logo and top-level navigation.
- **Renders:** Site title/logo ("Flixster"), navigation placeholder
- **Props:** None
- **State:** None

---

### SearchBar

- **Responsibility:** Accepts user input to search movies by title and submits the query on form submission.
- **Renders:** A form with a text input, a submit button, and a "Now Playing" button (visible when in search mode) to return to the default view
- **Props:**
  - `onSearch(query)` — callback invoked with the trimmed search string on submit
  - `onClear()` — callback to return to Now Playing view
  - `isSearchMode` — boolean to conditionally show the "Now Playing" button
- **State:**
  - `input` — controlled input value for the text field
- **Behavior:** On form submit (Enter key or button click), calls `onSearch` with the trimmed input. Empty submissions are ignored. Calls `onClear` when "Now Playing" is clicked (also clears input).

---

### SortControl

- **Responsibility:** Allows the user to change the sort order of the displayed movie list.
- **Renders:** A dropdown/select element with sort options: "Default", "Title (A-Z)", "Rating (High-Low)", "Release Date (Newest)"
- **Props:**
  - `currentSort` — the currently active sort criteria
  - `onSortChange(criteria)` — callback invoked when a new sort is selected
- **State:** None (controlled by parent)

---

### MovieList

- **Responsibility:** Renders the grid of movie cards and handles the "Load More" pagination trigger.
- **Renders:** A responsive grid of MovieCard components, a "Load More" button, or empty/loading/error states
- **Props:**
  - `movies` — array of movie objects to display
  - `onMovieClick(movieId)` — callback when a card is clicked (triggers detail fetch)
  - `onLoadMore()` — callback to fetch the next page of results
  - `hasMore` — boolean indicating if more pages are available
  - `isLoading` — boolean to show loading state
  - `error` — error string to display error state with retry
  - `onRetry()` — callback to retry failed fetch
  - `isSearchMode` — boolean (for "no results" message context)
  - `searchQuery` — current query (for "no results for 'xyz'" message)
- **State:** None (presentational, driven entirely by props)

---

### MovieCard

- **Responsibility:** Displays a single movie's poster, title, and rating as a clickable card.
- **Renders:** Movie poster image (or placeholder fallback if `poster_path` is null), title text, vote average badge
- **Props:**
  - `movie` — single movie object with: `id`, `title`, `poster_path`, `vote_average`
  - `onClick(movieId)` — callback when card is clicked
- **State:** None
- **Image handling:** If `poster_path` is null, render a styled placeholder div with the movie title displayed as text.

---

### MovieModal

- **Responsibility:** Displays detailed information about a selected movie in an accessible overlay/dialog, including AI-generated recommendation.
- **Renders:** Backdrop overlay, backdrop image, movie poster, title, release date, runtime, genres, overview/description, rating, AI recommendation section, close button
- **Props:**
  - `movie` — the selected movie detail object (title, backdrop_path, poster_path, release_date, runtime, genres, overview, vote_average)
  - `onClose()` — callback to close the modal
- **State:**
  - `aiRecommendation` — string response from OpenRouter AI
  - `aiLoading` — boolean for AI fetch loading state
  - `aiError` — error message if AI call fails
- **Accessibility:**
  - `role="dialog"` and `aria-modal="true"` on the modal container
  - Focus is trapped inside the modal while open
  - `Escape` key closes the modal
  - Focus returns to the triggering MovieCard on close

---

### Footer

- **Responsibility:** Displays footer content such as copyright info and attribution.
- **Renders:** Copyright text, "Powered by TMDB" attribution link
- **Props:** None
- **State:** None

---

## API Contracts

### Constants

```js
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE_URL = "https://image.tmdb.org/t/p";
const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";
```

### 1. Now Playing Endpoint

- **URL:** `GET ${TMDB_BASE_URL}/movie/now_playing`
- **Parameters:**
  - `api_key` (required) — from `import.meta.env.VITE_TMDB_API_KEY`
  - `language` — `en-US`
  - `page` — page number (1-indexed)
- **Response fields used:**
  - `results[]`:
    - `id` — unique movie identifier
    - `title` — movie title
    - `poster_path` — path to poster (nullable — use placeholder if null)
    - `vote_average` — rating out of 10
    - `release_date` — YYYY-MM-DD string
  - `total_pages` — for "Load More" visibility
  - `page` — current page number
- **Error cases:**
  - 401 — invalid API key → show error with "Check your API key" message
  - Network failure → show error with retry button

---

### 2. Search Movies Endpoint

- **URL:** `GET ${TMDB_BASE_URL}/search/movie`
- **Parameters:**
  - `api_key` (required)
  - `query` (required) — debounced search string
  - `language` — `en-US`
  - `page` — page number
- **Response fields used:**
  - `results[]` — same fields as Now Playing
  - `total_pages` — for pagination
  - `total_results` — show "no results" message when 0
- **Error cases:**
  - 401 — invalid API key
  - 422 — empty query (guard against this client-side)
  - Network failure → show error with retry

---

### 3. Movie Details Endpoint

- **URL:** `GET ${TMDB_BASE_URL}/movie/{movie_id}`
- **Parameters:**
  - `api_key` (required)
  - `language` — `en-US`
- **Response fields used:**
  - `id`, `title`, `poster_path`, `vote_average`
  - `backdrop_path` — for modal header image (nullable — use poster as fallback)
  - `release_date` — release date string
  - `runtime` — in minutes
  - `genres[]` — array of `{ id, name }`
  - `overview` — plot summary
- **Error cases:**
  - 401 — invalid API key
  - 404 — movie not found
  - Network failure → show error toast, don't open modal

---

## State Architecture

| Variable | Type | Initial Value | Owner | Update Trigger |
|----------|------|---------------|-------|----------------|
| `movies` | `Array<Object>` | `[]` | App | API response (now playing or search); Load More appends new results |
| `searchQuery` | `String` | `""` | App | Set on SearchBar form submit; cleared on "Now Playing" click |
| `page` | `Number` | `1` | App | "Load More" increments; new search or clear resets to 1 |
| `totalPages` | `Number` | `1` | App | Set from API response `total_pages` |
| `sortBy` | `String` | `""` | App | SortControl dropdown change |
| `selectedMovie` | `Object \| null` | `null` | App | Set after successful detail fetch; cleared on modal close |
| `isLoading` | `Boolean` | `true` | App | True before initial/page fetch, false after response or error |
| `isModalLoading` | `Boolean` | `false` | App | True when detail fetch starts (on card click), false on success/error |
| `error` | `String \| null` | `null` | App | Set on fetch failure, cleared on next successful fetch |
| `isSearchMode` | `Boolean` | `false` | App | True when searchQuery is non-empty, false when cleared |
| `input` | `String` | `""` | Header | User typing in search field |
| `aiRecommendation` | `String` | `""` | MovieModal | OpenRouter API response when modal opens |
| `aiLoading` | `Boolean` | `false` | MovieModal | True when AI fetch starts, false on completion |
| `aiError` | `String \| null` | `null` | MovieModal | Set on AI fetch failure |

---

## Data Flow

When the app loads, `App` calls the TMDb Now Playing endpoint (page 1). The JSON response contains a `results` array of movie objects. App stores this array in the `movies` state variable — no transformation is needed beyond extracting `results` and `total_pages` from the response.

Before passing movies to `MovieList`, App applies client-side sorting based on `sortBy`. If `sortBy` is empty (default), the original API order is preserved. Otherwise, a sorted copy is created. When "Load More" appends new results, the full array is re-sorted.

`MovieList` receives the sorted array and renders a `MovieCard` for each item. Each `MovieCard` displays the title, poster (or placeholder), and rating.

When a user clicks a `MovieCard`, the card calls `onClick(movie.id)` which propagates up through `MovieList` to `App`. App sets `isModalLoading` to true and shows a loading indicator. App fetches the Movie Details endpoint using that ID to get runtime, genres, and backdrop (not available in the list response). On success, App sets `selectedMovie` and `isModalLoading` to false, which renders `MovieModal`. On failure, App shows an error toast and does not open the modal.

For search: when the user submits the form (Enter or button click), `SearchBar` calls `onSearch(query)`. App resets `page` to 1, sets `isSearchMode` to true, and fetches the Search endpoint. "Load More" in search mode passes the same `searchQuery` with an incremented page.

```
User submits search (Enter / click)
    │
    ▼
App.onSearch(query) → fetch search endpoint
    │
    ▼
App stores results in `movies`, applies sort
    │
    ▼
MovieList receives sorted movies[]
    │
    ▼
MovieCard renders each movie (poster or placeholder)
    │
    │ (user clicks card)
    ▼
App.onMovieClick(id) → set isModalLoading, fetch /movie/{id}
    │
    ├── Success → set selectedMovie → MovieModal renders
    │                                      │
    │                                      └── triggers OpenRouter AI call
    │
    └── Failure → show error toast, modal stays closed
```

---

## Empty / Loading / Error States

| State | What Renders |
|-------|-------------|
| Initial load (before first fetch completes) | Loading skeleton grid (placeholder cards with shimmer animation) |
| Search returns 0 results | "No movies found for '{query}'" message with suggestion to try another search |
| API fetch fails (network/server error) | Error message with description and a "Retry" button |
| Movie detail fetch in progress | Loading spinner/overlay on the clicked card area |
| Movie detail fetch fails | Error toast notification; modal does not open |
| Movie has no poster_path | Placeholder image with movie title text overlay |
| Movie has no backdrop_path | Use poster image as fallback in modal header |

---

## Accessibility

### MovieModal
- Container has `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` points to the modal's title element
- Focus is trapped inside the modal (Tab cycles through modal-only focusable elements)
- `Escape` key closes the modal
- On close, focus returns to the MovieCard that triggered it
- Backdrop click closes the modal

### MovieCard
- Each card is keyboard-navigable (`tabIndex="0"`)
- `Enter` and `Space` keys trigger the click handler
- Cards have `role="button"` and `aria-label` with the movie title

### General
- All images have descriptive `alt` text
- Color contrast meets WCAG AA standards
- Interactive elements have visible focus indicators

---

## Sort Behavior

- **Client-side only** — TMDb Now Playing doesn't support server-side sort
- Operates on the full `movies` array (all pages loaded so far)
- When "Load More" appends new results, the combined array is re-sorted
- Sort options:
  - `""` (Default) — original API order
  - `"title"` — alphabetical A-Z
  - `"rating"` — vote_average descending (highest first)
  - `"release_date"` — release_date descending (newest first)

---

## AI Feature Spec

### Overview

When a user opens a movie's detail modal, an AI-generated "Watch Recommendation" is displayed below the movie overview. This gives users a personalized reason to watch (or skip) the movie.

### Display Component

`MovieModal` — the AI recommendation appears in a dedicated section below the movie overview.

### Input Data Sent to AI

From the `selectedMovie` object:
- `title` — movie title
- `genres` — array of genre names (joined as comma-separated string)
- `overview` — plot summary

### Prompt Spec

- **Role:** You are a concise movie critic and recommendation assistant.
- **Task:** Given a movie's title, genres, and plot summary, provide a 2–3 sentence "Watch Recommendation" that helps a viewer decide if this movie is for them.
- **Inputs:** Title, genres, overview (passed as user message context)
- **Output format:** 2–3 sentences, no markdown, no spoilers.
- **Constraints:** Keep it under 100 words. Do not reveal plot twists. Be honest about tone (e.g., "dark", "lighthearted").
- **Failure behavior:** Display "Recommendation unavailable at this time." as fallback text.

### API Endpoint

- **URL:** `https://openrouter.ai/api/v1/chat/completions`
- **Model:** TBD (e.g., `meta-llama/llama-3-8b-instruct` or similar free-tier model)
- **Headers:**
  - `Authorization: Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`
  - `Content-Type: application/json`

### State Management

- `aiRecommendation` (String, initial `""`) — stored in MovieModal, updated when AI response arrives
- `aiLoading` (Boolean, initial `false`) — set true when fetch begins, false on completion
- `aiError` (String | null, initial `null`) — set if fetch fails

### UX Flow

1. User clicks a MovieCard → loading indicator shown → detail fetch fires
2. On detail fetch success → modal opens with full movie info
3. Simultaneously, MovieModal fires AI fetch using movie's title/genres/overview
4. While AI loading: show "Generating recommendation..." with subtle spinner
5. On AI success: display the 2–3 sentence recommendation
6. On AI failure: display "Recommendation unavailable at this time." (no broken UI)

---

## Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| Submit-based search (Enter/button click) | Simpler implementation, fewer API calls, user has explicit control over when search fires |
| Client-side sort on loaded data | TMDb Now Playing doesn't support sort params; keeps UX fast |
| Don't open modal until detail fetch succeeds | Prevents showing an empty/broken modal state |
| Full accessibility on modal | Focus trap + Escape + aria is the correct accessible pattern for dialogs |
| Placeholder image for null posters | Better than hiding cards — user still sees the movie exists |
| Load More works in both modes | Consistent behavior regardless of Now Playing vs Search |
