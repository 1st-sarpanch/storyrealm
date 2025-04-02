import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Genre, Story, User } from '@shared/schema';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { StoryCard } from '@/components/story/story-card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';

export default function GenrePage() {
  const { id } = useParams();
  const genreId = parseInt(id);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch genre data
  const { data: genre, isLoading: isGenreLoading } = useQuery<Genre>({
    queryKey: [`/api/genres/${genreId}`],
  });

  // Fetch stories for this genre
  const { data: stories, isLoading: isStoriesLoading } = useQuery<Story[]>({
    queryKey: [`/api/genres/${genreId}/stories`],
    enabled: !!genreId,
  });

  // Fetch users (for author info)
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!stories,
  });

  // Filter stories by search term
  const filteredStories = stories?.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort stories based on selection
  const sortedStories = filteredStories?.slice().sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  // Find author for a story
  const getAuthor = (authorId: number): User | undefined => {
    return users?.find(user => user.id === authorId);
  };

  // Set page title
  useEffect(() => {
    document.title = genre ? `${genre.name} Stories - StoryVerse` : 'Loading Genre - StoryVerse';
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, [genre]);

  if (isGenreLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-highlight" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!genre) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-heading text-red-500 mb-4">Genre Not Found</h1>
            <p className="text-gray-400 mb-6">The genre you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Genre Hero */}
        <div className="relative h-80">
          <img 
            src={genre.coverImage || `https://images.unsplash.com/photo-1578393098337-5594cce112da?auto=format&fit=crop&w=1920&h=500&q=80`} 
            alt={genre.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex items-center mb-4">
                <div className="bg-accent/80 rounded-full p-2 mr-4">
                  <i className={`${genre.icon || 'fas fa-book'} text-highlight text-xl genre-icon`}></i>
                </div>
                <h1 className="text-5xl font-heading font-bold text-white">{genre.name}</h1>
              </div>
              <p className="text-xl text-gray-300 max-w-2xl">{genre.description}</p>
            </div>
          </div>
        </div>
        
        {/* Stories Section */}
        <section className="container mx-auto px-4 py-12">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-heading text-highlight">
              {sortedStories?.length || 0} Stories Available
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 md:w-auto w-full">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  type="text"
                  placeholder="Search stories..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-primary/30 border-secondary w-full"
                />
              </div>
              
              {/* Sort select */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-primary/30 border-secondary">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Stories Grid */}
          {isStoriesLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-highlight" />
            </div>
          ) : sortedStories && sortedStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedStories.map(story => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  genre={genre}
                  author={getAuthor(story.authorId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No stories found for this genre.</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="border-highlight text-highlight hover:bg-highlight hover:text-background"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
