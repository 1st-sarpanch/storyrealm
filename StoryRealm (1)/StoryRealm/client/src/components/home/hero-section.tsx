import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Genre } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export function HeroSection() {
  const [, navigate] = useLocation();
  const { data: genres, isLoading } = useQuery<Genre[]>({
    queryKey: ['/api/genres'],
  });

  const scrollToGenres = () => {
    const genresSection = document.getElementById('genres');
    if (genresSection) {
      genresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-transparent to-neutral">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-white">
          <span className="text-highlight">Immerse</span> Yourself in <span className="text-accent">Endless</span> Tales
        </h1>
        <p className="text-xl md:text-2xl font-body mb-8 text-gray-300">
          Discover, create, and share stories that will transport you to worlds beyond imagination.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Button 
            size="lg"
            onClick={scrollToGenres}
            className="px-8 py-3 bg-accent hover:bg-red-900 text-white rounded-lg font-body font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Explore Stories
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate('/write')}
            className="px-8 py-3 bg-transparent border-2 border-highlight text-highlight rounded-lg font-body font-semibold hover:bg-highlight hover:text-neutral transition-all duration-300 transform hover:scale-105"
          >
            Start Writing
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {isLoading ? (
            <div className="flex justify-center w-full py-4">
              <Loader2 className="h-6 w-6 animate-spin text-highlight" />
            </div>
          ) : (
            genres?.map((genre) => (
              <Link 
                key={genre.id} 
                href={`/genre/${genre.id}`}
                className="px-4 py-2 bg-secondary bg-opacity-50 hover:bg-opacity-80 rounded-full text-gray-200 hover:text-highlight transition-colors duration-300 font-body text-sm"
              >
                <i className={`${genre.icon || 'fas fa-book'} mr-2 text-highlight`}></i>
                {genre.name}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Animated scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <i className="fas fa-chevron-down text-highlight text-2xl"></i>
      </div>
    </section>
  );
}
