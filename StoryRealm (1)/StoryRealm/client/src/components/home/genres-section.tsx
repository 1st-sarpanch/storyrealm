import { useState } from 'react';
import { Link } from 'wouter';
import { Genre } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { GenreCard } from '@/components/story/genre-card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function GenresSection() {
  const [showAll, setShowAll] = useState(false);
  
  const { data: genres, isLoading, error } = useQuery<Genre[]>({
    queryKey: ['/api/genres'],
  });
  
  // Show only 4 genres initially, then all on "show more" click
  const displayedGenres = showAll 
    ? genres 
    : genres?.slice(0, 4);
  
  return (
    <section id="genres" className="py-16 px-4 relative">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-radial from-secondary/30 to-transparent opacity-50 pointer-events-none"></div>
      <div className="container mx-auto relative z-10">
        <h2 className="text-4xl font-heading font-bold text-center text-gray-100 mb-12">
          Explore <span className="text-highlight">Magical</span> Genres
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-highlight" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Failed to load genres</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedGenres?.map((genre) => (
                <GenreCard key={genre.id} genre={genre} />
              ))}
            </div>
            
            {/* More genres button */}
            {genres && genres.length > 4 && (
              <div className="text-center mt-10">
                <Button 
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 py-3 border-2 border-highlight text-highlight rounded-lg font-body font-semibold hover:bg-highlight hover:text-neutral transition-all duration-300"
                >
                  {showAll ? 'Show Less' : 'Explore All Genres'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
