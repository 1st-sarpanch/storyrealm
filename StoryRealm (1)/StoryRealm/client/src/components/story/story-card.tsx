import { Link } from 'wouter';
import { useState } from 'react';
import { Story, Genre, User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Volume2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StoryCardProps {
  story: Story;
  genre?: Genre;
  author?: User;
  isBookmarked?: boolean;
}

export function StoryCard({ story, genre, author, isBookmarked = false }: StoryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  
  // Calculate excerpt from content - strip HTML and limit to 150 chars
  const excerpt = story.content
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .substring(0, 150) + (story.content.length > 150 ? '...' : '');
  
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in to bookmark");
      
      if (bookmarked) {
        // We'd need the bookmark ID here in a real implementation
        // For now just toggle state without API call
        return { success: true };
      } else {
        const res = await apiRequest("POST", "/api/bookmarks", {
          storyId: story.id
        });
        return await res.json();
      }
    },
    onSuccess: () => {
      setBookmarked(!bookmarked);
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      
      toast({
        title: bookmarked ? "Bookmark removed" : "Story bookmarked",
        description: bookmarked ? "Story removed from your bookmarks" : "Story added to your bookmarks",
      });
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark stories",
        variant: "destructive",
      });
      return;
    }
    
    bookmarkMutation.mutate();
  };
  
  return (
    <Link href={`/story/${story.id}`}>
      <div className="story-card relative rounded-lg overflow-hidden h-96 group cursor-pointer">
        <img 
          src={story.coverImage || `https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?auto=format&fit=crop&w=600&h=800&q=80`} 
          alt={story.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        
        <div className="story-card-content absolute inset-0 flex flex-col justify-end p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {genre && (
              <span className="px-2 py-1 bg-accent text-white text-xs rounded-full">
                {genre.name}
              </span>
            )}
            <span className="px-2 py-1 bg-secondary text-white text-xs rounded-full">
              <i className="fas fa-star mr-1 text-highlight"></i>
              {story.rating || '4.5'}
            </span>
            
            {/* Display tags if available */}
            {story.tags && story.tags.length > 0 && 
              story.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-primary/40 text-gray-200 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))
            }
          </div>
          
          <h3 className="text-2xl font-heading font-bold text-white mb-2">{story.title}</h3>
          
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {story.summary || excerpt}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Avatar className="w-8 h-8 border-2 border-highlight">
                <AvatarImage src={author?.profilePicture || undefined} alt={author?.username || 'Author'} />
                <AvatarFallback className="bg-secondary text-highlight">
                  {author?.username?.substring(0, 2).toUpperCase() || 'AU'}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-gray-300 text-sm">
                {author?.username || 'Anonymous'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {story.audioUrl && (
                <Button
                  size="icon" 
                  variant="ghost"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="text-gray-400 hover:text-accent transition-colors duration-300"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              )}
              
              <Button
                size="icon" 
                variant="ghost"
                onClick={handleBookmark}
                className={`text-gray-400 hover:text-highlight transition-colors duration-300 ${bookmarked ? 'text-highlight' : ''}`}
              >
                {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
