import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-neutral border-t border-secondary py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="text-3xl font-accent text-highlight tracking-wider flex items-center mb-4">
              StoryVerse
              <i className="fas fa-book-open ml-2 text-accent text-sm"></i>
            </Link>
            <p className="text-gray-400 mb-6">
              A community for storytellers and story lovers to connect, create, and explore.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-highlight transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-highlight transition">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-highlight transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-highlight transition">
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-heading text-white mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#genres" className="text-gray-400 hover:text-highlight transition">Genres</Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-highlight transition">Featured Stories</Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-highlight transition">New Releases</Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-highlight transition">Most Popular</Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-highlight transition">Authors</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-heading text-white mb-4">Create</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/write" className="text-gray-400 hover:text-highlight transition">Write a Story</Link>
              </li>
              <li>
                <Link href="/write" className="text-gray-400 hover:text-highlight transition">Record Audio</Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-400 hover:text-highlight transition">Writing Tips</Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-400 hover:text-highlight transition">Challenges</Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-400 hover:text-highlight transition">Prompts</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-heading text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-highlight transition">Help Center</Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-highlight transition">Community Guidelines</Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-highlight transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-highlight transition">Terms of Service</Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-highlight transition">Contact Us</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-secondary/50 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} StoryVerse. All rights reserved. Unleash your imagination.</p>
          <p className="mt-2 text-highlight font-bold">Powered By ManishChhetri</p>
        </div>
      </div>
    </footer>
  );
}
