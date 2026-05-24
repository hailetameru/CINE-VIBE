export interface WatchedMovie {
  id: string;
  title: string;
  year: string;
  genres: string[];
  userRating: number; // 1 to 5 stars
  moods?: string[];    // e.g., "Mind-bending", "Exciting"
  userReview?: string;
  watchedAt?: string;
}

export interface UserPreferences {
  genres: string[];
  moods: string[];
  pace: 'any' | 'fast-paced' | 'slow-burn' | 'balanced';
  eras: string[]; // e.g., "Classic (before 1980)", "Retro (80s/90s)", "Modern (2000s-2015)", "Recent (2016-present)"
  languages: string[]; // e.g., "English", "Foreign language" (with subtitles)
  exclusions: string[]; // e.g., "no horror", "no gore", "no violence"
}

export interface MovieRecommendation {
  id: string;
  title: string;
  year: string;
  genres: string[];
  director: string;
  rating: string; // PG, R, PG-13, etc
  duration: string;
  plot: string;
  recommendationReason: string;
  similarityScore: number; // percentage match
  keyCast: string[];
  whereToWatch: string;
  primaryColorAccent: string; // e.g., "emerald", "orange", "indigo", "rose", "amber", "violet", "cyan"
}

export const PRESET_GENRES = [
  "Action", "Adventure", "Sci-Fi", "Fantasy", "Drama", "Comedy", 
  "Romance", "Thriller", "Horror", "Mystery", "Anime", "Documentary"
];

export const PRESET_MOODS = [
  "Feel-good", "Mind-bending", "Thought-provoking", "Intense & Suspenseful", 
  "Emotional & Heartwarming", "Dark & Gritty", "Lighthearted & Fun", "Spooky & Haunting"
];

export const PRESET_ERAS = [
  "Classics (Pre-1980)",
  "Retro (1980s - 1990s)",
  "Millennium (2000s - 2015)",
  "Modern Cinema (2016 - Present)"
];

export interface CuratedMoviePreset {
  title: string;
  year: string;
  genres: string[];
  plot: string;
}

export const CURATED_PRESETS: CuratedMoviePreset[] = [
  { title: "Inception", year: "2010", genres: ["Sci-Fi", "Action", "Thriller"], plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O." },
  { title: "The Dark Knight", year: "2008", genres: ["Action", "Drama", "Thriller"], plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability." },
  { title: "Interstellar", year: "2014", genres: ["Sci-Fi", "Adventure", "Drama"], plot: "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival." },
  { title: "Parasite", year: "2019", genres: ["Drama", "Thriller", "Comedy"], plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan." },
  { title: "Spirited Away", year: "2001", genres: ["Anime", "Fantasy", "Adventure"], plot: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts." },
  { title: "Pulp Fiction", year: "1994", genres: ["Thriller", "Drama", "Comedy"], plot: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption." },
  { title: "La La Land", year: "2016", genres: ["Romance", "Drama", "Comedy"], plot: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future." },
  { title: "Whiplash", year: "2014", genres: ["Drama", "Thriller"], plot: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential." },
  { title: "The Matrix", year: "1999", genres: ["Sci-Fi", "Action"], plot: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence." },
  { title: "Eternal Sunshine of the Spotless Mind", year: "2004", genres: ["Romance", "Sci-Fi", "Drama"], plot: "When their relationship turns sour, a young couple undergoes a medical procedure to have each other erased from their memories forever." },
  { title: "The Godfather", year: "1972", genres: ["Drama"], plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son." },
  { title: "Alien", year: "1979", genres: ["Sci-Fi", "Horror"], plot: "Over forty years after its release, Ridley Scott's masterpiece remains one of the most terrifying science-fiction horror experiences ever made." },
  { title: "Get Out", year: "2017", genres: ["Horror", "Mystery", "Thriller"], plot: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception eventually reaches a boiling point." }
];
