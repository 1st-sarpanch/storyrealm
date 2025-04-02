import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add web fonts
const linkElement = document.createElement('link');
linkElement.rel = 'stylesheet';
linkElement.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Raleway:wght@300;400;600&family=Pirata+One&display=swap';
document.head.appendChild(linkElement);

// Add title
const titleElement = document.createElement('title');
titleElement.textContent = 'StoryVerse - Immerse Yourself in Tales';
document.head.appendChild(titleElement);

// Add Font Awesome
const faScript = document.createElement('link');
faScript.rel = 'stylesheet';
faScript.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
document.head.appendChild(faScript);

createRoot(document.getElementById("root")!).render(<App />);
