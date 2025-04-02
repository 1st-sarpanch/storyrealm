import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Story, User, Genre } from '@shared/schema';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Mic, Volume2, Play, Pause } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export default function RealStoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const { user } = useAuth();

  // Fetch real stories (user submitted stories with audio)
  const { data: stories, isLoading: isStoriesLoading } = useQuery<Story[]>({
    queryKey: ['/api/stories/real'],
  });

  // Fetch users for author info
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!stories,
  });

  // Fetch genres for genre info
  const { data: genres } = useQuery<Genre[]>({
    queryKey: ['/api/genres'],
    enabled: !!stories,
  });

  // Filter stories based on search term
  const filteredStories = stories?.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAuthorName(story.authorId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get author name by ID
  const getAuthorName = (authorId: number): string => {
    const author = users?.find(user => user.id === authorId);
    return author ? author.username : `User ${authorId}`;
  };

  // Get genre name by ID
  const getGenreName = (genreId: number): string => {
    const genre = genres?.find(genre => genre.id === genreId);
    return genre ? genre.name : '';
  };

  // Handle audio playback
  const toggleAudio = (storyId: number, audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
      if (playingAudioId === storyId) {
        setPlayingAudioId(null);
        setCurrentAudio(null);
        return;
      }
    }
    
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setPlayingAudioId(null);
      setCurrentAudio(null);
    };
    
    audio.play();
    setPlayingAudioId(storyId);
    setCurrentAudio(audio);
  };

  // Clean up audio on component unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, []);

  // Set page title and scroll to top
  useEffect(() => {
    document.title = 'Real Stories - StoryVerse';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-80">
          <img 
            src="https://images.unsplash.com/photo-1601513237633-13ab91857169?fit=crop&w=1920&h=500&q=80" 
            alt="Real Stories" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <h1 className="text-5xl font-heading font-bold text-white mb-4">
                Real <span className="text-highlight">Stories</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Listen to authentic stories recorded by our community members. Experience the power of storytelling through the human voice.
              </p>
            </div>
          </div>
        </section>
        
        {/* Stories Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            {/* Search input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                type="text"
                placeholder="Search real stories..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-primary/30 border-secondary w-full"
              />
            </div>
            
            <Link href="/write">
              <Button className="bg-accent hover:bg-red-900 text-white">
                <Mic className="mr-2 h-4 w-4" /> Record Your Story
              </Button>
            </Link>
          </div>
          
          {/* Stories Grid */}
          {isStoriesLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-highlight" />
            </div>
          ) : filteredStories && filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map(story => (
                <Card key={story.id} className="bg-neutral border-secondary hover:border-highlight transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-accent text-white">
                        {getGenreName(story.genreId)}
                      </Badge>
                      <Badge variant="outline" className="border-highlight text-highlight">
                        Real Story
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-heading text-white">
                      {story.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {story.summary}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <Avatar className="w-8 h-8 border-2 border-highlight">
                        <AvatarFallback className="bg-secondary text-highlight">
                          {getAuthorName(story.authorId).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <p className="text-sm text-gray-200">{getAuthorName(story.authorId)}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(story.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Audio Player */}
                    {story.audioUrl && (
                      <div className="bg-primary/30 p-3 rounded-lg border border-secondary">
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleAudio(story.id, story.audioUrl!)}
                            className="mr-3 w-10 h-10 rounded-full border-highlight text-highlight hover:bg-highlight hover:text-background p-0 flex items-center justify-center"
                          >
                            {playingAudioId === story.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                          </Button>
                          <div className="flex-grow">
                            <div className="text-sm text-gray-300 mb-1.5 flex items-center">
                              <Volume2 className="h-4 w-4 mr-1.5 text-gray-400" /> 
                              <span>Audio Narration</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full w-full">
                              <div 
                                className={`h-full bg-highlight rounded-full ${
                                  playingAudioId === story.id ? 'animate-progress' : 'w-0'
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Link href={`/story/${story.id}`} className="w-full">
                      <Button variant="outline" className="w-full border-secondary text-gray-300 hover:bg-secondary/30">
                        Read Full Story
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">
                {searchTerm 
                  ? 'No stories matching your search were found.' 
                  : 'No real stories have been submitted yet.'}
              </p>
              <p className="text-gray-300 mb-6">
                {searchTerm 
                  ? 'Try searching with different keywords.' 
                  : 'Be the first to share your story with the community!'}
              </p>
              <Link href="/write">
                <Button className="bg-accent hover:bg-red-900 text-white">
                  <Mic className="mr-2 h-4 w-4" /> Record Your Story
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}