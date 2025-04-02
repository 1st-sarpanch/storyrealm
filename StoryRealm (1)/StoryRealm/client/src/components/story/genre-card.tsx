import { Link } from 'wouter';
import { Genre } from '@shared/schema';

interface GenreCardProps {
  genre: Genre;
  storyCount?: number;
}

export function GenreCard({ genre, storyCount = 50 }: GenreCardProps) {
  // Map genre names to FontAwesome icons
  const getIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('fantasy')) return 'fas fa-crown';
    if (nameLower.includes('horror')) return 'fas fa-ghost';
    if (nameLower.includes('sci') || nameLower.includes('science')) return 'fas fa-rocket';
    if (nameLower.includes('fairy') || nameLower.includes('tales')) return 'fas fa-hat-wizard';
    if (nameLower.includes('traditional')) return 'fas fa-scroll';
    if (nameLower.includes('detective')) return 'fas fa-magnifying-glass';
    if (nameLower.includes('romance') || nameLower.includes('romantic')) return 'fas fa-heart';
    
    return 'fas fa-book';
  };
  
  return (
    <Link href={`/genre/${genre.id}`}>
      <div className="bg-gradient-to-br from-neutral to-secondary rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer">
        <div className="relative h-48">
          <img 
            src={genre.coverImage || `https://images.unsplash.com/photo-1578393098337-5594cce112da?auto=format&fit=crop&w=600&h=400&q=80`} 
            alt={genre.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral/90 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-2xl font-heading font-bold text-highlight">{genre.name}</h3>
            <p className="text-gray-300 text-sm">{storyCount} Stories</p>
          </div>
          <div className="absolute top-3 right-3 bg-accent/80 rounded-full p-2">
            <i className={`${getIcon(genre.name)} text-highlight genre-icon`}></i>
          </div>
        </div>
        <div className="p-4">
          <p className="text-gray-300 text-sm mb-4">{genre.description}</p>
          <span className="text-highlight hover:text-accent transition-colors duration-300 font-body flex items-center text-sm">
            View Stories <i className="fas fa-arrow-right ml-2"></i>
          </span>
        </div>
      </div>
    </Link>
  );
}
