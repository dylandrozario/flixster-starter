import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const IMG_BASE_URL = "https://image.tmdb.org/t/p";
export const POSTER_SIZE = "w500";
export const BACKDROP_SIZE = "w1280";

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

export async function searchMovies(query, page) {
  try {
    const { data } = await tmdb.get("/search/movie", { params: { query, page } });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.status === 401
        ? "Invalid API key. Check your .env file."
        : `Failed to fetch movies (${error.response?.status || "network error"})`
    );
  }
}

export async function fetchMovieDetails(movieId) {
  try {
    const { data } = await tmdb.get(`/movie/${movieId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.status === 404
        ? "Movie not found."
        : error.response?.status === 401
        ? "Invalid API key."
        : `Failed to fetch movie details (${error.response?.status || "network error"})`
    );
  }
}

export async function fetchMovieTrailer(movieId) {
  try {
    const { data } = await tmdb.get(`/movie/${movieId}/videos`);
    const trailer = data.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || data.results.find(
      (v) => v.site === "YouTube"
    );
    return trailer ? trailer.key : null;
  } catch {
    return null;
  }
}

const AI_SYSTEM_PROMPT = `You are an enthusiastic but honest film critic. Write a 2–3 sentence watch recommendation for the movie described below. Speak directly to the viewer in second person. Be specific about what type of viewer would enjoy it and what mood it suits. Do not reveal plot twists. Do not use generic phrases like "must-see" or "masterpiece." Keep it under 80 words. No markdown. No "I" statements.`;

export async function getMovieInsight(title, genres, overview) {
  try {
    const { data } = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        max_tokens: 150,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: AI_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `Title: ${title}\nGenres: ${genres}\nOverview: ${overview}\n\nWrite exactly 2-3 sentences. Do not repeat yourself.`
          }
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
    console.error("AI insight failed:", error);
    console.error("Status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    console.error("API key present:", !!OPENROUTER_API_KEY);
    return null;
  }
}

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

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

export function toggleSetItem(set, item) {
  const next = new Set(set);
  if (next.has(item)) {
    next.delete(item);
  } else {
    next.add(item);
  }
  return next;
}
