# Flixster — How My App Works

## The Big Picture

This is a React app that fetches movies from TMDb, displays them in a grid, lets users search/sort/paginate, shows details in a modal, and generates AI recommendations. One parent component (App) owns all the important data and passes it down to child components.

---

## How I Use React Concepts

### Props

I use props whenever a child component needs data or needs to talk to its parent.

**Data flows down:** App has the movies → passes them to MovieList → MovieList passes each movie to MovieCard.

**Actions flow up:** When a user clicks a card, MovieCard doesn't know what to do with that click — it just calls `onClick(movie.id)` which is a function the parent gave it. That function eventually reaches App, which handles the actual logic.

**General rule:** If a component needs data it doesn't own, it gets it through props. If it needs to trigger something in a parent, it calls a callback prop.

---

### useState

I use useState whenever something on screen needs to change over time.

**For data from APIs:** `movies`, `selectedMovie` — starts empty, gets filled after a fetch.

**For UI toggles:** `sidebarOpen`, `showTrailer`, `dropdownOpen` — booleans that show/hide things.

**For tracking user input:** `input` in the search bar — updates every keystroke so I always know what's typed.

**For tracking user selections:** `sortBy`, `page`, `searchQuery` — the app needs to remember what mode it's in.

**For async status:** `isLoading`, `error` — lets me show spinners and error messages.

**General rule:** If something needs to change and the UI should update when it does, it's state.

---

### useEffect

I use useEffect whenever I need to do something *outside* of rendering — fetching data, listening to events, or running code at specific moments.

**Fetching on mount:** App fetches the initial movies when it first appears. Empty `[]` dependency = run once.

**Fetching when something changes:** Hero fetches new movie details whenever the carousel index changes. `[movie?.id]` dependency = re-run when movie changes.

**Adding event listeners:** Header listens for scroll events, MovieList listens for click-outside, MovieModal listens for keyboard events. Always return a cleanup function to remove the listener.

**General rule:** If it involves the outside world (APIs, DOM, timers), it belongs in useEffect. The dependency array controls *when* it re-runs.

---

### Conditional Rendering

I use conditional rendering to show different things based on the current state.

**Show/hide entire components:** `{selectedMovie && <MovieModal />}` — modal only exists when a movie is selected.

**Toggle between views:** `{showTrailer ? <iframe> : <img>}` — either the trailer or the backdrop shows.

**Early returns for states:** If loading, return a spinner. If error, return an error message. If empty results, return "no movies found." Only render the full grid if data is ready.

**General rule:** Use `&&` for "show this if true." Use ternary `? :` for "show this OR that." Use early returns for mutually exclusive states.

---

### Controlled Inputs

I use controlled inputs so React owns the form values, not the browser.

The search bar's value always matches my `input` state. Every keystroke updates state, state flows back to the input. This means I can clear it programmatically (`setInput("")`) and validate before submitting.

**General rule:** If you need to read, reset, or validate an input value, make it controlled with `value={state}` + `onChange={setState}`.

---

## How My Features Work

### Search

User types → controlled input updates on each keystroke → user submits (Enter or click) → App gets the query → resets page to 1 → calls TMDb search endpoint → results replace the current movie list → UI updates.

Clearing search: resets everything back to Now Playing mode and re-fetches page 1.

**Key idea:** Search and Now Playing are the same flow with a different API endpoint. One function (`loadMovies`) handles both — it checks if there's a query and picks the right endpoint.

---

### Load More (Pagination)

Button click → page number increments → fetches the next page → **appends** new movies to existing array (doesn't replace) → button disappears when page equals totalPages.

**Key idea:** The append uses `setMovies(prev => [...prev, ...newMovies])` — the callback form guarantees you're working with the latest array, not a stale reference.

---

### Sorting

User picks a sort option → `sortBy` state updates → App passes `sortMovies(movies, sortBy)` to MovieList → a sorted **copy** is rendered.

**Key idea:** Sorting happens during render, not in state. The original `movies` array is never mutated — I create a copy with `[...movies]` and sort that. This means Load More still appends to the unsorted source, and the sort is always freshly applied.

---

### Modal

Card click → App fetches movie details (separate endpoint with runtime/genres) → sets `selectedMovie` → modal renders → on close, clears state and returns focus to the card.

**Key idea:** The Now Playing list doesn't include runtime or genres. The modal needs a second API call using the movie's ID to get the full details. This is why the modal fetches on open rather than using data from the list.

---

### AI Recommendation

Modal opens → useEffect fires → sends movie title/genres/overview to OpenRouter → AI returns 2-3 sentences → displayed below the overview. If it fails, shows a friendly fallback message.

**Key idea:** The `cancelled` flag in the useEffect cleanup prevents setting state if the user closes the modal before the AI responds. Without it, you'd get a React error about updating unmounted components.

---

### Trailers

Modal/Hero fetches the YouTube trailer key from TMDb's videos endpoint → shows a play button over the backdrop → clicking it swaps the image for an embedded YouTube iframe → "Back" button reverts to the image.

**Key idea:** The trailer is just a YouTube URL embedded in an iframe. TMDb gives you a video `key` which you plug into `youtube.com/embed/{key}`.

---

### Favorites / Watched / Heart

Three separate `Set` objects in App — each stores movie IDs. Clicking a button toggles the ID in/out of the Set. Cards check `starred.has(movie.id)` to show filled/empty icons. Sidebar filters the movie array by these Sets.

**Key idea:** Sets give O(1) lookup — checking if a movie is favorited is instant regardless of how many movies exist. The toggle helper creates a new Set each time (React needs a new reference to trigger re-render).

---

### Sidebar

Filters the full movie array: `movies.filter(m => starred.has(m.id))`. Displays the filtered list with poster thumbnails. Two tabs switch between favorites and watched.

**Key idea:** Sidebar doesn't store its own movie data. It derives what to show from the existing `movies` array + the `starred`/`watched` Sets. This is called "derived state" — computed from other state rather than stored separately.

---

### Card Flip Animation

Pure CSS — `perspective` on the outer card creates 3D space, `transform-style: preserve-3d` on the inner element keeps children in 3D, `rotateY(180deg)` on hover flips it, `backface-visibility: hidden` hides the non-visible face.

**Key issue I solved:** Both faces must be the exact same size. Adding `box-sizing: border-box` ensures padding doesn't expand the back face beyond the front face's dimensions.

---

### Modal Animations

**Entrance:** CSS `@keyframes slideUp` on mount — fades in and slides up.

**Exit:** Setting `closing` state applies a `slideDown` animation class, then after 250ms delay, the component actually unmounts. This lets the animation finish before the DOM element disappears.

---

### Dropdown

Click-based (not hover) to avoid conflicts with card flip animations. Uses a ref + click-outside listener to close when clicking elsewhere. CSS transition handles the fade-in/slide-down.

---

## How API Calls Work

All API calls live in `utils/api.js` — components never call fetch/axios directly.

**TMDb (GET requests):** "Give me data that exists" — movie lists, details, trailer keys. Uses an axios instance with pre-configured base URL and API key.

**OpenRouter (POST request):** "Here's a prompt, generate a response" — sends movie context, gets back AI text. POST because you're sending data (the prompt) for the server to process.

**Error handling pattern:** Every function wraps its call in try/catch. On failure, it either throws (for App to catch and set error state) or returns null (for AI where we show a fallback).

---

## Architecture Decisions In One Sentence Each

- **State in App:** Because multiple children need the same data.
- **API calls in utils:** Because components should focus on UI, not HTTP logic.
- **Callback props for actions:** Because children can't modify parent state directly.
- **Sets for favorites:** Because checking membership is O(1) vs O(n) with arrays.
- **Sorting during render:** Because it's derived data — don't store what you can compute.
- **Separate detail fetch for modal:** Because list endpoints return minimal data.
- **Controlled inputs:** Because I need to read and reset values programmatically.
- **useEffect with cleanup:** Because event listeners and subscriptions must be removed to avoid memory leaks.
- **Cancelled flag in async effects:** Because the component might unmount before the response arrives.
- **box-sizing: border-box:** Because padding was making the card faces different sizes.

---

## 5-Minute Explanation

"My app fetches movies from TMDb and displays them in a responsive grid. App owns all shared state and passes data down via props — children communicate back up through callbacks. I use useEffect for all side effects like API calls and event listeners. The search, pagination, and sort all modify state in App, which triggers re-renders in the affected children. The modal makes a separate API call for full details, and fires an OpenRouter AI call for recommendations. Favorites and watched are tracked with Sets for fast lookups. All API logic is centralized in a utils file so components stay focused on rendering."

---

## Deep Dives — Code Explained

These sections walk through actual code for one example of each major concept/feature.

---

### Props & Callbacks (MovieCard → App communication)

```jsx
// In MovieCard.jsx
const MovieCard = ({ movie, onClick, isStarred, onToggleStar }) => {
  const handleClick = (e) => {
    e.currentTarget.blur();
    onClick(movie.id);
  };

  const handleStar = (e) => {
    e.stopPropagation();
    onToggleStar(movie.id);
  };
```

**What's happening:**

- `{ movie, onClick, isStarred, onToggleStar }` — destructuring props from the parent. MovieCard doesn't own this data, it just receives it.
- `onClick(movie.id)` — calling the parent's function and passing the movie's ID up. MovieCard doesn't know what happens next — it just reports "this card was clicked."
- `e.stopPropagation()` — prevents the star button click from ALSO triggering the card click. Without this, starring a movie would also open the modal.
- `e.currentTarget.blur()` — removes focus from the card after clicking so the CSS flip animation resets when the modal closes.

**Why it works this way:** MovieCard is "dumb" — it displays data and reports user actions. App is "smart" — it decides what to do (open modal, toggle a Set). This separation means MovieCard is reusable anywhere.

---

### useState (Toggle Pattern)

```jsx
// In App.jsx
const [starred, setStarred] = useState(new Set());

const handleToggleStar = (movieId) => {
  setStarred((prev) => toggleSetItem(prev, movieId));
};
```

```jsx
// In utils/api.js
export function toggleSetItem(set, item) {
  const next = new Set(set);
  if (next.has(item)) {
    next.delete(item);
  } else {
    next.add(item);
  }
  return next;
}
```

**What's happening:**

- `useState(new Set())` — initial state is an empty Set. A Set is like an array but checking "is this item in here?" is instant (O(1)) instead of scanning every element.
- `setStarred((prev) => ...)` — the callback form. `prev` is guaranteed to be the latest state. If I wrote `setStarred(toggleSetItem(starred, movieId))`, `starred` might be stale from a previous render.
- `new Set(set)` — creates a copy. React only re-renders if the state reference changes. Mutating the existing Set (`set.add(item)`) wouldn't trigger a re-render because it's still the same object.
- The toggle logic: if the ID is already in the Set, remove it. If not, add it. Simple on/off.

**Why it works this way:** React compares state by reference, not by value. You must return a NEW Set for React to know something changed. The utility function handles the copy + toggle so App stays clean.

---

### useEffect (Fetching on Mount)

```jsx
// In App.jsx
useEffect(() => {
  loadMovies("", 1);
}, []);
```

**What's happening:**

- `useEffect(() => { ... }, [])` — the empty array `[]` means "run this once, when the component first appears in the DOM."
- `loadMovies("", 1)` — fetches Now Playing page 1. Empty string means "no search query" so it hits the Now Playing endpoint.

**Why the empty array matters:** Without it, this would run on EVERY render — causing an infinite loop (fetch → setState → re-render → fetch → setState...). The `[]` says "no dependencies, just run once."

---

### useEffect (Reacting to Changes + Cleanup)

```jsx
// In MovieModal.jsx
useEffect(() => {
  if (!movie) return;
  let cancelled = false;

  const genres = movie.genres ? movie.genres.map((g) => g.name).join(", ") : "";

  setAiLoading(true);
  setAiRecommendation(null);
  setAiError(null);

  getMovieInsight(movie.title, genres, movie.overview || "").then((result) => {
    if (cancelled) return;
    if (result) {
      setAiRecommendation(result);
    } else {
      setAiError("We couldn't generate a recommendation...");
    }
    setAiLoading(false);
  });

  return () => { cancelled = true; };
}, [movie?.id]);
```

**What's happening:**

- `[movie?.id]` dependency — re-runs whenever a different movie is shown in the modal.
- `let cancelled = false` + `return () => { cancelled = true }` — this is the cleanup pattern for async effects. If the user closes the modal (component unmounts) before the AI responds, the cleanup runs and sets `cancelled = true`. Then when the promise resolves, it checks `if (cancelled) return` and does nothing — preventing a "set state on unmounted component" error.
- `setAiLoading(true)` before the call, `setAiLoading(false)` after — brackets the async operation with a loading state.
- The `.then()` handles both success (set recommendation) and failure (set error message).

**Why the cancelled flag:** React StrictMode in development double-fires effects. Without this flag, you'd get two API calls and potentially stale results from the first one overwriting the second.

---

### Controlled Input (Search Bar)

```jsx
// In Header.jsx
const [input, setInput] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();
  const trimmed = input.trim();
  if (trimmed.length === 0) return;
  onSearch(trimmed);
};

<input
  type="text"
  placeholder="Search movies..."
  value={input}
  onChange={(e) => setInput(e.target.value)}
/>
```

**What's happening:**

- `value={input}` — the input ALWAYS displays whatever is in state. You can't type something that state doesn't know about.
- `onChange={(e) => setInput(e.target.value)}` — every single keystroke updates state. Type "b" → state is "b" → input shows "b". Type "a" → state is "ba" → input shows "ba".
- `e.preventDefault()` — stops the form from refreshing the page (default browser behavior for form submit).
- `input.trim()` — removes spaces from both ends. This prevents submitting "   " as a search.
- `if (trimmed.length === 0) return` — don't search for nothing.

**Why controlled:** I need to clear the input when the user clicks "home" (`setInput("")`). With an uncontrolled input, I'd have to reach into the DOM. With controlled, I just update state and the input clears itself.

---

### API Call Pattern (axios)

```jsx
// In utils/api.js
const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: "en-US"
  }
});

export async function fetchNowPlaying(page) {
  try {
    const { data } = await tmdb.get("/movie/now_playing", { params: { page } });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.status === 401
        ? "Invalid API key. Check your .env file."
        : `Failed to fetch movies (${error.response?.status || "network error"})`
    );
  }
}
```

**What's happening:**

- `axios.create({...})` — creates a reusable instance with the base URL and default params baked in. Every call automatically includes the API key and language without repeating them.
- `const { data } = await tmdb.get(...)` — destructures the response. Axios wraps the API response in an object; `.data` is the actual JSON.
- `{ params: { page } }` — adds `?page=1` to the URL. Combined with the defaults, the full URL becomes `/movie/now_playing?api_key=xxx&language=en-US&page=1`.
- `throw new Error(...)` — re-throws with a user-friendly message. The component calling this will catch it and display the message.
- `error.response?.status` — axios puts the HTTP status on `error.response`. The `?.` is optional chaining — if there's no response at all (network failure), it returns undefined instead of crashing.

**Why a separate file:** Components don't need to know about URLs, headers, or error status codes. They just call `fetchNowPlaying(1)` and either get data or an error message.

---

### AI Call (POST request)

```jsx
// In utils/api.js
export async function getMovieInsight(title, genres, overview) {
  try {
    const { data } = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        max_tokens: 150,
        temperature: 0.7,
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: `Title: ${title}\nGenres: ${genres}\nOverview: ${overview}...` }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return data.choices[0].message.content;
  } catch (error) {
    return null;
  }
}
```

**What's happening:**

- `axios.post(url, body, config)` — POST because we're sending data (the prompt) for the server to process. GET is for retrieving existing data.
- `messages` array — the chat format. `system` defines the AI's personality/rules. `user` provides the specific movie context.
- `max_tokens: 150` — caps response length to prevent rambling/repetition.
- `temperature: 0.7` — controls randomness. Lower = more predictable, higher = more creative.
- `data.choices[0].message.content` — OpenRouter's response format. The AI's text is nested at this path.
- Returns `null` on failure — the component checks for null and shows a fallback message instead of crashing.

**Why POST not GET:** You're sending a body (the prompt). GET requests don't have a body. Also, you're asking the server to *generate* something new, not retrieve something that already exists.

---

### Sorting (Pure Function — Derived Data)

```jsx
// In utils/api.js
export function sortMovies(movies, sortBy) {
  if (!sortBy) return movies;
  const sorted = [...movies];
  switch (sortBy) {
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "rating":
      sorted.sort((a, b) => b.vote_average - a.vote_average);
      break;
    case "release_date":
      sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      break;
  }
  return sorted;
}

// In App.jsx — called during render:
<MovieList movies={sortMovies(movies, sortBy)} ... />
```

**What's happening:**

- `if (!sortBy) return movies` — no sort selected? Return the original array unchanged.
- `[...movies]` — creates a COPY. Never sort the original — `Array.sort()` mutates in place, and mutating state directly breaks React.
- `localeCompare` — string comparison that handles special characters and capitalization correctly.
- `b.vote_average - a.vote_average` — descending order (highest first). Flip a and b for ascending.
- `new Date(b.release_date) - new Date(a.release_date)` — converts date strings to timestamps for comparison. Newest first.

**Why during render, not in state:** If I stored the sorted array in state, I'd need to re-sort every time Load More adds movies. By computing it fresh each render, the source of truth (`movies`) stays clean and the sorted view is always correct.

---

### CSS 3D Flip Animation

```css
.movie-card {
  aspect-ratio: 2 / 3;
  perspective: 1000px;
  cursor: pointer;
}

.movie-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.movie-card:hover .movie-card-inner {
  transform: rotateY(180deg);
}

.movie-card-front,
.movie-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  backface-visibility: hidden;
}

.movie-card-back {
  transform: rotateY(180deg);
}
```

**What's happening:**

- `perspective: 1000px` on the outer card — creates a 3D viewing space. Lower values = more dramatic depth effect.
- `transform-style: preserve-3d` on the inner — tells the browser "my children exist in 3D space, don't flatten them."
- `rotateY(180deg)` on hover — rotates the inner container around the vertical axis.
- `backface-visibility: hidden` on both faces — when a face is rotated away from you (showing its back), hide it completely.
- The back face has `transform: rotateY(180deg)` by default — it starts flipped, so when the container rotates 180deg, the back face ends up facing you (180 + 180 = 360 = front-facing).
- `box-sizing: border-box` — THE critical fix. Both faces are `width: 100%; height: 100%` with `position: absolute`. But the back has `padding: 20px`. Without border-box, padding ADDS to the size (making the back 40px wider/taller). With border-box, padding is included INSIDE the 100%, so both faces are identical in size.

**Why both faces are absolutely positioned:** They need to occupy the exact same space — stacked on top of each other. Only one is visible at a time (the other has its backface hidden).

---

### Modal Exit Animation (Delayed Unmount)

```jsx
// In MovieModal.jsx
const [closing, setClosing] = useState(false);

const handleClose = () => {
  setClosing(true);
  setTimeout(() => {
    onClose();
  }, 250);
};
```

```css
.modal-overlay { animation: fadeIn 0.3s ease; }
.modal-content { animation: slideUp 0.3s ease; }

.modal-overlay.modal-closing { animation: fadeOut 0.25s ease forwards; }
.modal-content.modal-content-closing { animation: slideDown 0.25s ease forwards; }
```

**What's happening:**

- `setClosing(true)` — adds the `.modal-closing` class, which triggers the exit CSS animation.
- `setTimeout(() => onClose(), 250)` — waits 250ms (matching the animation duration) THEN actually calls `onClose()` which sets `selectedMovie = null` in App, unmounting the modal.
- Without the delay, React would unmount the component immediately and you'd never see the animation.
- `forwards` in CSS — keeps the animation's final state (opacity: 0) after it completes, preventing a flash back to visible before unmount.

**Why not just unmount:** React has no built-in exit animations. When `selectedMovie` becomes null, the modal vanishes instantly. The `closing` state + setTimeout trick lets the animation play FIRST, then unmount.

---

### Click-Outside Detection (Dropdown)

```jsx
// In MovieList.jsx
const [dropdownOpen, setDropdownOpen] = useState(false);
const dropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
```

**What's happening:**

- `useRef(null)` — creates a reference to the dropdown DOM element. Unlike state, changing a ref doesn't cause a re-render.
- `ref={dropdownRef}` on the dropdown div — connects the ref to the actual DOM node.
- `document.addEventListener("mousedown", ...)` — listens for ALL clicks anywhere on the page.
- `!dropdownRef.current.contains(e.target)` — checks if the click happened OUTSIDE the dropdown. `contains()` returns true if the clicked element is inside the ref'd element.
- If outside → close the dropdown. If inside → do nothing (let the item click handler handle it).
- Cleanup removes the listener when the component unmounts.

**Why this pattern:** CSS-only hover dropdowns couldn't be used here because they conflicted with the card flip hover animation. Click-based with click-outside is the standard pattern for dropdown menus in React.

---

### List Rendering with Keys

```jsx
// In MovieList.jsx
{movies.map((movie) => (
  <MovieCard
    key={movie.id}
    movie={movie}
    onClick={onMovieClick}
    isStarred={starred.has(movie.id)}
    ...
  />
))}
```

**What's happening:**

- `.map()` — transforms each item in the movies array into a React component. 20 movies = 20 MovieCards rendered.
- `key={movie.id}` — tells React which card is which. When the list changes (Load More adds items, sort reorders), React uses keys to figure out which cards moved/added/removed instead of re-creating all of them.
- `starred.has(movie.id)` — O(1) lookup. For each card, instantly checks if this movie is in the favorites Set.

**Why keys matter:** Without keys (or with index as key), React would re-render every single card when one is added. With stable IDs as keys, React knows "card 12345 moved from position 3 to position 7" and just moves the DOM node instead of destroying and recreating it.
