/**
 * This file contains constants used throughout the application
 */

// Genres with icons and descriptions
export const GENRE_ICONS: Record<string, string> = {
  "Fantasy": "fas fa-crown",
  "Horror": "fas fa-ghost",
  "Science Fiction": "fas fa-rocket",
  "Fairy Tales": "fas fa-hat-wizard",
  "Traditional Tales": "fas fa-scroll",
  "Detective": "fas fa-magnifying-glass",
  "Romance": "fas fa-heart",
  "default": "fas fa-book"
};

// Sample cover images for each genre (from Unsplash)
export const GENRE_COVERS: Record<string, string> = {
  "Fantasy": "https://images.unsplash.com/photo-1578393098337-5594cce112da?fit=crop&w=600&h=400&q=80",
  "Horror": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?fit=crop&w=600&h=400&q=80",
  "Science Fiction": "https://images.unsplash.com/photo-1501862700950-18382cd41497?fit=crop&w=600&h=400&q=80",
  "Fairy Tales": "https://images.unsplash.com/photo-1587653143598-a56351163849?fit=crop&w=600&h=400&q=80",
  "Traditional Tales": "https://images.unsplash.com/photo-1528158230071-d3829messaging88c5ddf?fit=crop&w=600&h=400&q=80",
  "Detective": "https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?fit=crop&w=600&h=400&q=80",
  "Romance": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?fit=crop&w=600&h=400&q=80",
  "default": "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?fit=crop&w=600&h=800&q=80"
};

// Default story cover images
export const DEFAULT_STORY_COVERS = [
  "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1511376777868-611b54f68947?fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1518946222227-364f22132616?fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1585681614757-b7ad176ed009?fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1589998059171-988d887df646?fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1601513237633-13ab91857169?fit=crop&w=600&h=800&q=80"
];

// Community topics - categories for community discussions
export const COMMUNITY_TOPICS = [
  "Writing Tips",
  "Story Ideas",
  "Character Development",
  "World Building",
  "Plot Twists",
  "Reader Feedback",
  "Author Spotlights",
  "Genre Discussions"
];

// Difficulty levels for writing challenges
export const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert"
];

// Writing prompt categories
export const PROMPT_CATEGORIES = [
  "Fantasy",
  "Horror",
  "Science Fiction",
  "Romance",
  "Mystery",
  "Adventure",
  "Historical",
  "Comedy"
];

// Audio file formats supported
export const SUPPORTED_AUDIO_FORMATS = ["audio/webm", "audio/mp3", "audio/wav", "audio/ogg"];

// Maximum file sizes
export const MAX_AUDIO_SIZE_MB = 10;
export const MAX_COVER_IMAGE_SIZE_MB = 2;

// Story length categories
export const STORY_LENGTH_CATEGORIES = {
  "Flash Fiction": "< 1,000 words",
  "Short Story": "1,000 - 7,500 words",
  "Novelette": "7,500 - 20,000 words",
  "Novella": "20,000 - 50,000 words",
  "Novel": "> 50,000 words"
};

// App-wide configuration
export const APP_CONFIG = {
  siteName: "StoryVerse",
  tagline: "Immerse Yourself in Tales",
  copyrightYear: new Date().getFullYear(),
  maxSummaryLength: 500,
  maxTitleLength: 100,
  minContentLength: 50,
  pageSize: 10
};
