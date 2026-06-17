# Flixster — Presentation Slide Deck

**Duration:** 4–5 minutes | **Audience:** Technical (engineers, managers, stakeholders)

---

## Key Highlights for Interviewer

- **3 most important files:** `src/App.jsx` (state orchestrator), `src/utils/api.js` (all external communication), `src/components/MovieModal/MovieModal.jsx` (most complex component with parallel async operations)
- **Most complex subsystem:** MovieModal — manages parallel API calls (trailer + AI), focus trapping, entrance/exit animations, and trailer embedding all within one component
- **Most innovative feature:** The AI-powered watch recommendation that calls OpenRouter with a structured prompt spec and gracefully handles rate limits and failures
- **Thing that would impress an interviewer:** The separation of concerns — API logic centralized in utils, components purely focused on UI, state ownership clearly defined, and the cancelled-flag pattern for preventing stale state updates in async effects

---

## Slide 1: What Is Flixster?

### Key Talking Points

- A Netflix-inspired movie discovery app built with React
- Fetches real-time "Now Playing" data from The Movie Database API
- Integrates AI-powered recommendations via OpenRouter
- Responsive design with interactive 3D card animations

### Speaker Notes

"Flixster is a movie discovery web app that shows what's currently playing in theaters. Think of it as a simplified Netflix browsing experience — you can search movies, sort them, watch trailers, and get AI-generated recommendations to help you decide what to watch tonight. It pulls live data from TMDb's API and uses OpenRouter for the AI feature. The target users are anyone deciding what to watch — it gives them enough information at a glance without overwhelming them."

### Visual Recommendation

Screenshot of the app homepage showing the hero section with a movie backdrop, the grid of cards below, and the dark Netflix-style theme.

---

## Slide 2: Architecture & Data Flow

### Key Talking Points

- Top-down data architecture — App owns all shared state
- Child components are presentational — receive data via props, report actions via callbacks
- API logic centralized in `utils/api.js` — components never call fetch directly
- Three external integrations: TMDb (movies), OpenRouter (AI), YouTube (trailers)

### Speaker Notes

"The architecture follows React's unidirectional data flow. App is the brain — it owns 14 state variables covering movies, pagination, search, sort, favorites, and the modal. Data flows down through props. When a user interacts with any component, that action flows back up through callback functions to App, which updates state and React re-renders the affected children.

All API communication is isolated in a single utils file using an axios instance with pre-configured defaults. Components never construct URLs or handle HTTP errors — they just call functions like `fetchNowPlaying(page)` and either get data back or an error message. This separation means I could swap TMDb for a different API without touching any component code."

### Visual Recommendation

```
          ┌─────────────────────────────────────┐
          │              App (State)             │
          │  movies, page, search, sort, modal   │
          └──────────┬──────────┬───────────────┘
                     │ props    │ props
          ┌──────────▼──┐  ┌───▼──────────────┐
          │    Hero     │  │   MovieList       │
          │  (carousel) │  │   (grid + sort)   │
          └─────────────┘  └───────┬───────────┘
                                   │ props
                              ┌────▼────┐
                              │MovieCard │ ×20
                              └─────────┘

          ┌─────────────────────────────────────┐
          │         utils/api.js                 │
          │  TMDb │ OpenRouter │ YouTube         │
          └─────────────────────────────────────┘
```

---

## Slide 3: Core Features

### Key Talking Points

- **Now Playing grid** — responsive 5-column layout with 3D flip cards on hover
- **Search** — controlled input, form submit, mode switching with clear
- **Pagination** — Load More appends results, hides at last page
- **Sort** — client-side reordering (title/rating/date) applied during render without mutating state
- **Detail Modal** — separate API call for runtime/genres, focus trap, entrance/exit animations

### Speaker Notes

"The core features cover the full CRUD-less movie browsing experience. The grid uses CSS Grid with fixed 5 columns on desktop, dropping to 3 on tablet and 2 on mobile. Each card has a CSS 3D flip animation on hover that reveals movie details and action buttons on the back.

Search and Now Playing share the same fetch function — it picks the right endpoint based on whether there's a query. The sort is a pure function that creates a sorted copy during render, never mutating the source array. This means Load More always appends to the clean data and the sort is freshly computed.

The modal makes a separate API call because the list endpoint doesn't return runtime or genres — that's a common API pattern where list endpoints return minimal data and detail endpoints return everything."

### Visual Recommendation

Side-by-side screenshots: card grid on the left, flipped card on the right, modal open in the center.

---

## Slide 4: Stretch Features

### Key Talking Points

- **AI Watch Recommendation** — OpenRouter API with structured prompt, loading state, graceful fallback
- **Embedded Trailers** — TMDb videos endpoint → YouTube iframe in both Hero and Modal
- **Favorites (star) & Watched (check)** — Set-based tracking with O(1) lookups
- **Sidebar** — slide-out panel filtering movies by starred/watched status
- **Deployment** — Render with `serve` for static file hosting on 0.0.0.0

### Speaker Notes

"Beyond the requirements, I implemented five stretch features. The AI recommendation calls OpenRouter when the modal opens, sending the movie's title, genres, and overview with a structured system prompt that defines the AI's role and constraints. It uses a cancelled-flag pattern to prevent setting state if the modal closes before the response arrives.

Trailers are embedded YouTube iframes — the Play button in both the hero and modal swaps the backdrop image for a video player. Favorites and watched use JavaScript Sets for instant membership checks — when rendering 60+ cards, checking `starred.has(movieId)` is O(1) versus scanning an array.

The sidebar derives its content from existing state — it filters the movies array by the starred/watched Sets rather than maintaining its own copy. This is derived state, computed fresh each render."

### Visual Recommendation

Modal screenshot showing: backdrop with play button, movie details, genre tags, and the AI recommendation section with the loading/result state.

---

## Slide 5: Engineering Decisions & Challenges

### Key Talking Points

- **CSS 3D flip bug** — `box-sizing: border-box` was the fix; padding made card faces different sizes
- **Dropdown vs hover conflict** — switched from CSS-hover dropdown to click-based with click-outside detection
- **AI rate limiting (429)** — changed from auto-fire to user-aware trigger, added cancelled flag for StrictMode
- **Modal exit animation** — delayed unmount pattern with `setTimeout` matching CSS animation duration
- **Render deployment** — `serve` on `0.0.0.0:10000` for correct port binding

### Speaker Notes

"The most frustrating bug was the card flip shifting left. After hours of debugging perspective origins and grid interactions, the fix was one line: `box-sizing: border-box`. The back face had padding that expanded it beyond the front face's dimensions — 260px vs 220px. Both faces need to be identical in size for the 3D rotation to look centered.

The sort dropdown originally used CSS hover, but it conflicted with the card flip — hovering over dropdown items also triggered the card beneath them. I switched to a click-based dropdown with a useRef and document-level mousedown listener for click-outside detection.

The AI feature hit OpenRouter's rate limit during development because React StrictMode double-fires effects. The cancelled-flag cleanup pattern prevents duplicate calls from setting stale state. I also learned that `max_tokens` and explicit 'do not repeat yourself' instructions are necessary to prevent the model from looping."

### Visual Recommendation

Code snippet showing the `box-sizing: border-box` fix with a before/after diagram of the card face sizes (220×330 vs 260×370).

---

## Slide 6: Reflections

### Key Talking Points

- **Enjoyed most:** Building the Netflix-style UI — dark theme, animations, the hero carousel
- **Most interesting:** The AI integration — prompt engineering is iterative; small wording changes dramatically affect output quality
- **Most challenging:** The CSS 3D card flip — understanding how perspective, transform-style, and backface-visibility interact took trial and error

### Speaker Notes

"What I enjoyed most was crafting the Netflix-style visual experience — the transparent header that transitions on scroll, the hero carousel with trailer playback, the card flip animation. It felt like building a real product rather than a homework assignment.

The most interesting part was prompt engineering for the AI recommendation. My initial prompts returned generic responses. Adding constraints like 'no I statements,' 'speak in second person,' 'no generic praise like must-see' made the output dramatically better. Small changes in the system message had outsized effects on quality.

The most challenging was definitely the 3D card flip. I spent significant time debugging a horizontal shift that turned out to be a one-line CSS fix. It taught me that 3D CSS transforms are extremely sensitive to element sizing — both faces of a flip card must be pixel-identical, and properties like padding or border can silently break that."

### Visual Recommendation

Split screen: the AI prompt spec on the left, an example AI response on the right showing how constraints shaped the output.

---

## Slide 7: Future Work

### Key Talking Points

- **Persistent storage** — save favorites/watched to localStorage or a backend database
- **User accounts** — authentication with personalized recommendations based on watch history
- **Server-side AI proxy** — move OpenRouter key to a backend to prevent client-side key exposure
- **Infinite scroll** — replace Load More button with intersection observer for seamless browsing
- **Would do differently:** Start with the box-sizing reset globally from day one; plan the dropdown interaction pattern before implementing card hover effects

### Speaker Notes

"If I had more time, the first thing I'd add is localStorage persistence for favorites and watched — right now they reset on page reload. Beyond that, a backend proxy for the OpenRouter key would solve the security issue of exposing API keys in client-side code.

I'd also replace the Load More button with an intersection observer for infinite scroll — it's a better UX for browsing large lists. And adding user accounts would enable personalized recommendations based on actual watch history rather than the single-movie context we send now.

If I could redo one thing, I'd set `box-sizing: border-box` globally in my reset CSS from the start. That one missing property cost me hours on the card flip bug. I'd also decide on click-based vs hover-based interactions before building both the dropdown and the card flip — they conflict fundamentally and I had to rebuild the dropdown mid-project."

### Visual Recommendation

Simple roadmap graphic with three tiers: "Now" (current features), "Next" (localStorage, infinite scroll), "Later" (backend, auth, personalization).

---

## Presentation Flow Summary

| Slide | Time | Focus |
|-------|------|-------|
| 1. What Is Flixster? | 0:00–0:30 | Problem, users, value |
| 2. Architecture | 0:30–1:30 | Component tree, data flow, API layer |
| 3. Core Features | 1:30–2:30 | Grid, search, pagination, sort, modal |
| 4. Stretch Features | 2:30–3:15 | AI, trailers, favorites, sidebar, deployment |
| 5. Challenges | 3:15–4:00 | Card flip bug, dropdown conflict, rate limiting |
| 6. Reflections | 4:00–4:30 | Enjoyed, interesting, challenging |
| 7. Future Work | 4:30–5:00 | What's next, what I'd change |
