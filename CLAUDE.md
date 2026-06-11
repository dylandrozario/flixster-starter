n this project, you will be building a website showing the latest movies currently playing in theaters. You will be using the The Movie Database API to get the list of latest movies and use HTML, CSS, and JavaScript to create your website.

💡 Read through all the milestones before you start. Later milestones often provide context that affects decisions you make in earlier ones. Skim end-to-end first, then come back to Milestone 0. It's expected — and encouraged — to revisit earlier milestones as your plan evolves.
🎯 Goals
By the end of this assignment, you will be able to:

Built a dynamic, interactive web application using React, guided by a written project specification you authored before implementation.
Defined component interfaces, API contracts, and state architecture before writing any code, then validated that your implementation matches what you planned.
Integrated multiple external APIs to fetch and display real-world data, with proper error handling for failed or empty responses.
Added an AI-powered feature using the OpenRouter API — specced in planning.md before implementation, implemented using the same prompt spec and fetch pattern from Unit 2.
Designed an accessible, responsive user interface that works across device sizes.
Flixster README template
✅ Features
Required Features

Display Movies (Home Page) — Fetch and display a list of movies currently playing in theaters using the TMDb Now Playing endpoint.

Movies are displayed in a responsive grid.
Each movie is shown in a MovieCard component that includes the title, poster image, and vote average.

Search Functionality — Allow users to search for movies by title.

Search results update the displayed movie list using the TMDb search endpoint.
Users can return to the Now Playing list after searching (e.g., by clearing the search or clicking "Now Playing").

Design Features

Users can load more movies by clicking a "Load More" button, which appends additional results to the existing list.
A modal displays detailed information about a movie when a MovieCard is clicked, including backdrop image, title, runtime, release date, genres, and overview.
Users can sort the current movie list by title, release date, or vote average using a dropdown.
A header and footer are present on the page.
Errors are handled gracefully — if an API call fails, the user sees a helpful message rather than a broken UI.
Loading states are displayed while data is being fetched.

Planning Documentation — Maintain a planning.md spec, committed before you write implementation code (you build this in Milestone 0 and update it as you go). By submission it should include:

A Component Architecture section listing at least 5 components, each with its responsibility, what it renders, and its props.
An API Contracts section documenting at least 2 TMDb endpoints, with URL, parameters, and the response fields you use.
A State Architecture section listing each state variable's name, type, initial value, owner component, and update trigger.
A Data Flow section describing how data moves from the TMDb response through the component hierarchy to the MovieCard.

AI-Powered Movie Insight — When a user opens a movie's detail modal, an AI-generated "Watch Recommendation" is displayed alongside the movie details.

Before implementation, an AI feature spec is documented in planning.md — including the prompt spec (role, task, inputs, output format, constraints, failure behavior), the OpenRouter endpoint and model, the state variable for the AI response, and how the feature is displayed in the modal.
The feature calls the OpenRouter API using the movie's title, genres, and overview as context.
A loading state is displayed while the AI response is being generated.
If the AI call fails, a graceful fallback message is shown rather than a broken UI.
A decisions log is included in planning.md documenting what AI generated, what was changed, and what was learned.
Stretch Features
Deployment - Deploy your Flixster app
Website is deployed via Render.
Embedded Trailers — When a movie modal is open, fetch and display the official trailer using the TMDb videos endpoint.
Favorite Button — Users can mark movies as favorites; favorited movies are visually distinguished.
Watched Checkbox — Users can mark movies as watched; watched movies are visually distinguished.
Sidebar — A sidebar panel allows users to filter the movie list by favorited or watched status.
