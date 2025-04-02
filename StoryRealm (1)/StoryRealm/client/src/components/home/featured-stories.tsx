import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Story, User, Genre } from '@shared/schema';
import { Link } from 'wouter';
import { StoryCard } from '@/components/story/story-card';
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2 
} from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Fetch additional data needed for each story
const useEnhancedStoryData = (stories: Story[] | undefined) => {
  // Get all author IDs from stories
  const authorIds = stories?.map(story => story.authorId) || [];
  const genreIds = stories?.map(story => story.genreId) || [];
  
  // Fetch authors data
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!stories && authorIds.length > 0,
  });
  
  // Fetch genres data
  const { data: genres } = useQuery<Genre[]>({
    queryKey: ['/api/genres'],
    enabled: !!stories && genreIds.length > 0,
  });
  
  // Enhance story data with author and genre information
  const enhancedStories = stories?.map(story => {
    const author = users?.find(user => user.id === story.authorId);
    const genre = genres?.find(genre => genre.id === story.genreId);
    
    return {
      story,
      author,
      genre
    };
  });
  
  return enhancedStories;
};

export function FeaturedStories() {
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  
  // Fetch real stories (with audio) first
  const { data: realStories, isLoading: isRealStoriesLoading } = useQuery<Story[]>({
    queryKey: ['/api/stories/real'],
  });
  
  // Fetch all stories as backup
  const { data: allStories, isLoading: isAllStoriesLoading } = useQuery<Story[]>({
    queryKey: ['/api/stories'],
    enabled: !!realStories && realStories.length < 5, // Only fetch if we don't have enough real stories
  });
  
  // Combine and prioritize stories with audio
  useEffect(() => {
    if (realStories || allStories) {
      const audioStories = realStories || [];
      const otherStories = allStories || [];
      
      // Prioritize stories with audio, but ensure we have at least 5 featured stories
      const combined = [...audioStories];
      
      if (combined.length < 5 && otherStories.length > 0) {
        // Add stories without audio to fill in
        const storiesWithoutAudio = otherStories.filter(
          story => !story.audioUrl && !combined.some(s => s.id === story.id)
        );
        combined.push(...storiesWithoutAudio.slice(0, 5 - combined.length));
      }
      
      setFeaturedStories(combined.slice(0, 5));
    }
  }, [realStories, allStories]);
  
  // Get enhanced story data with author and genre info
  const enhancedStories = useEnhancedStoryData(featuredStories);
  
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
  
  const isLoading = isRealStoriesLoading || isAllStoriesLoading;
  
  // Helper function to get author name
  const getAuthorName = (authorId: number | undefined): string => {
    const author = enhancedStories?.find(
      es => es.story.id === (playingAudioId || 0)
    )?.author;
    return author ? author.username : `Author #${authorId}`;
  };
  
  // Helper function to get genre name
  const getGenreName = (genreId: number | undefined): string => {
    const genre = enhancedStories?.find(
      es => es.story.id === (playingAudioId || 0)
    )?.genre;
    return genre ? genre.name : '';
  };
  
  return (
    <section className="py-16 px-4 relative">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-heading font-bold text-gray-100">
            <span className="text-highlight">Featured</span> Stories
          </h2>
          <Link href="/real-stories" className="text-highlight hover:text-accent transition-colors duration-300 font-body flex items-center">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-highlight" />
          </div>
        ) : enhancedStories && enhancedStories.length > 0 ? (
          <div className="relative">
            {/* Main Featured Carousel */}
            <Carousel className="w-full">
              <CarouselContent>
                {enhancedStories.map(({ story, author, genre }) => (
                  <CarouselItem key={story.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="bg-neutral border-secondary hover:border-highlight transition-all duration-300 h-full flex flex-col">
                        <CardHeader className="relative h-52 p-0 overflow-hidden rounded-t-lg">
                          <img 
                            src={story.coverImage || 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=2070'} 
                            alt={story.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral via-neutral/70 to-transparent"></div>
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <Badge className="bg-accent text-white">
                              {genre?.name || 'Fantasy'}
                            </Badge>
                            {story.audioUrl && (
                              <Badge variant="outline" className="border-highlight text-highlight">
                                <Volume2 className="mr-1 h-3 w-3" /> Audio
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="flex-grow pt-4">
                          <Link href={`/story/${story.id}`}>
                            <CardTitle className="text-xl font-heading text-white hover:text-highlight transition-colors mb-2">
                              {story.title}
                            </CardTitle>
                          </Link>
                          <p className="text-gray-400 line-clamp-3 mb-4">{story.summary}</p>
                          
                          <div className="flex items-center">
                            <Avatar className="w-8 h-8 border-2 border-highlight">
                              <AvatarFallback className="bg-secondary text-highlight">
                                {author?.username?.substring(0, 2).toUpperCase() || 'UN'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-2">
                              <p className="text-sm text-gray-200">{author?.username || `Author #${story.authorId}`}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(story.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between border-t border-secondary/30 pt-4">
                          <Link href={`/story/${story.id}`} className="flex-1 mr-2">
                            <Button variant="outline" className="w-full border-secondary text-gray-300 hover:bg-secondary/30">
                              Read Story
                            </Button>
                          </Link>
                          
                          {story.audioUrl && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => toggleAudio(story.id, story.audioUrl || '')}
                              className="rounded-full border-highlight text-highlight hover:bg-highlight hover:text-background"
                              disabled={!story.audioUrl}
                            >
                              {playingAudioId === story.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-neutral/80 hover:bg-neutral border border-secondary" />
              <CarouselNext className="right-2 bg-neutral/80 hover:bg-neutral border border-secondary" />
            </Carousel>
            
            {/* Audio Player (shown when playing audio) */}
            {playingAudioId && (
              <div className="mt-6 bg-primary/30 p-4 rounded-lg border border-secondary flex items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const story = featuredStories.find(s => s.id === playingAudioId);
                    if (story?.audioUrl) toggleAudio(playingAudioId, story.audioUrl);
                  }}
                  className="mr-4 w-10 h-10 rounded-full border-highlight text-highlight hover:bg-highlight hover:text-background p-0 flex items-center justify-center"
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <div className="flex-grow">
                  <div className="text-sm text-gray-300 mb-1.5 flex items-center justify-between">
                    <div className="flex items-center">
                      <Volume2 className="h-4 w-4 mr-1.5 text-gray-400" /> 
                      <span>Now Playing: {featuredStories.find(s => s.id === playingAudioId)?.title}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {getAuthorName(featuredStories.find(s => s.id === playingAudioId)?.authorId)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full w-full">
                    <div className="h-full bg-highlight rounded-full animate-progress"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No featured stories available.</p>
            <Link href="/write">
              <Button className="bg-accent hover:bg-red-900 text-white">
                Create Your Own Story
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
