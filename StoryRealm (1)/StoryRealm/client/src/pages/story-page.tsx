import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Story, User, Genre, Comment } from '@shared/schema';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Bookmark, BookmarkCheck, Calendar, Heart, MessageSquare, 
  Play, Share2, Volume2, Loader2, Send
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

// Comment form schema
const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long')
});

type CommentFormValues = z.infer<typeof commentSchema>;

export default function StoryPage() {
  const { id } = useParams();
  const storyId = id ? parseInt(id) : 0;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create form for comments
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: ''
    }
  });
  
  // Fetch story data
  const { data: story, isLoading: isStoryLoading } = useQuery<Story>({
    queryKey: [`/api/stories/${storyId}`],
    enabled: !!storyId,
  });
  
  // Fetch genre
  const { data: genre } = useQuery<Genre>({
    queryKey: [`/api/genres/${story?.genreId}`],
    enabled: !!story?.genreId,
  });
  
  // Fetch author
  const { data: author } = useQuery<User>({
    queryKey: [`/api/users/${story?.authorId}`],
    enabled: !!story?.authorId,
  });
  
  // Fetch comments
  const { data: comments, isLoading: isCommentsLoading } = useQuery<Comment[]>({
    queryKey: [`/api/stories/${storyId}/comments`],
    enabled: !!storyId,
  });
  
  // Fetch user's bookmarks
  const { data: bookmarks = [] } = useQuery<any[]>({
    queryKey: ['/api/bookmarks'],
    enabled: !!user,
  });
  
  // Check if story is bookmarked
  useEffect(() => {
    if (bookmarks && bookmarks.length > 0 && story) {
      setIsBookmarked(bookmarks.some((bookmark: { storyId: number }) => bookmark.storyId === story.id));
    }
  }, [bookmarks, story]);
  
  // Setup audio player
  useEffect(() => {
    if (story?.audioUrl) {
      const audio = new Audio(story.audioUrl);
      setAudioElement(audio);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [story?.audioUrl]);
  
  // Toggle audio playback
  const toggleAudio = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in to bookmark");
      if (!story) throw new Error("No story to bookmark");
      
      if (isBookmarked) {
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
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      
      toast({
        title: isBookmarked ? "Bookmark removed" : "Story bookmarked",
        description: isBookmarked ? "Story removed from your bookmarks" : "Story added to your bookmarks",
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
  
  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      if (!user) throw new Error("Must be logged in to comment");
      if (!story) throw new Error("No story to comment on");
      
      const res = await apiRequest("POST", `/api/stories/${story.id}/comments`, {
        content: data.content,
        storyId: story.id,
        authorId: user.id
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}/comments`] });
      commentForm.reset();
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Comment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle comment submission
  const onCommentSubmit = (values: CommentFormValues) => {
    commentMutation.mutate(values);
  };
  
  // Set page title
  useEffect(() => {
    document.title = story ? `${story.title} - StoryVerse` : 'Loading Story - StoryVerse';
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, [story]);
  
  if (isStoryLoading) {
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
  
  if (!story) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-heading text-red-500 mb-4">Story Not Found</h1>
            <p className="text-gray-400 mb-6">The story you're looking for doesn't exist.</p>
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
        {/* Story Header */}
        <div className="relative h-96">
          <img 
            src={story.coverImage || `https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?auto=format&fit=crop&w=1920&h=600&q=80`} 
            alt={story.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {genre && (
                  <Badge variant="secondary" className="bg-accent text-white">
                    {genre.name}
                  </Badge>
                )}
                {story.isUserSubmitted && (
                  <Badge variant="outline" className="border-highlight text-highlight">
                    User Submitted
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-secondary text-white">
                  <i className="fas fa-star mr-1 text-highlight"></i>
                  {story.rating || '4.5'}
                </Badge>
                
                {/* Display tags if available */}
                {story.tags && story.tags.length > 0 && story.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-primary/40 border-primary/60 text-gray-200">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-5xl font-heading font-bold text-white mb-4">{story.title}</h1>
              
              <div className="flex items-center">
                {author && (
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10 border-2 border-highlight">
                      <AvatarImage src={author.profilePicture || undefined} alt={author.username} />
                      <AvatarFallback className="bg-secondary text-highlight">
                        {author.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-gray-200">{author.username}</p>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(story.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="ml-auto flex gap-3">
                  {story.audioUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleAudio}
                      className="border-secondary text-gray-300 hover:bg-secondary"
                    >
                      {isPlaying ? (
                        <>
                          <Volume2 className="mr-2 h-4 w-4" /> Pause Audio
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" /> Listen
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => bookmarkMutation.mutate()}
                    disabled={!user || bookmarkMutation.isPending}
                    className={`${isBookmarked 
                      ? 'border-highlight text-highlight' 
                      : 'border-secondary text-gray-300 hover:bg-secondary'}`}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="mr-2 h-4 w-4" /> Bookmarked
                      </>
                    ) : (
                      <>
                        <Bookmark className="mr-2 h-4 w-4" /> Bookmark
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link copied!",
                        description: "Story link copied to clipboard",
                      });
                    }}
                    className="border-secondary text-gray-300 hover:bg-secondary"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Story Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-neutral border-secondary shadow-xl mb-12">
                <CardContent className="p-8">
                  <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl text-gray-300 mb-6 font-medium italic">
                      {story.summary}
                    </p>
                    
                    <div 
                      className="prose prose-headings:font-heading prose-headings:text-highlight prose-p:text-gray-300 max-w-none"
                      dangerouslySetInnerHTML={{ __html: story.content }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Comments Section */}
              <h2 className="text-3xl font-heading text-highlight mb-6">
                {comments?.length || 0} Comments
              </h2>
              
              {user ? (
                <form 
                  onSubmit={commentForm.handleSubmit(onCommentSubmit)} 
                  className="mb-8"
                >
                  <Textarea 
                    placeholder="Share your thoughts about this story..." 
                    className="bg-neutral border-secondary mb-2 min-h-24"
                    {...commentForm.register('content')}
                  />
                  {commentForm.formState.errors.content && (
                    <p className="text-red-500 text-sm mb-2">
                      {commentForm.formState.errors.content.message}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={commentMutation.isPending}
                      className="bg-highlight hover:bg-accent text-white"
                    >
                      {commentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" /> Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <Card className="bg-neutral border-secondary mb-8">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-300 mb-4">
                      You need to be logged in to post comments.
                    </p>
                    <Link href="/auth">
                      <Button className="bg-accent hover:bg-red-900">
                        Sign In
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
              
              {isCommentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-highlight" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map(comment => (
                    <Card key={comment.id} className="bg-neutral border-secondary">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-3">
                          <Avatar className="w-8 h-8 border-2 border-secondary">
                            <AvatarFallback className="bg-secondary text-highlight">
                              {comment.authorId.toString().substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <p className="text-gray-200 text-sm font-medium">
                              User {comment.authorId}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-300">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
            
            {/* Sidebar */}
            <div>
              <Card className="bg-neutral border-secondary sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading text-highlight mb-4">About this Story</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm">Genre</p>
                      <p className="text-gray-200">{genre?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Published</p>
                      <p className="text-gray-200">
                        {new Date(story.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Rating</p>
                      <p className="text-gray-200">
                        <i className="fas fa-star text-highlight mr-1"></i>
                        {story.rating || '4.5'}/5
                      </p>
                    </div>
                    {author && (
                      <div>
                        <p className="text-gray-400 text-sm">Author</p>
                        <div className="flex items-center">
                          <Avatar className="w-6 h-6 border border-highlight">
                            <AvatarFallback className="bg-secondary text-highlight">
                              {author.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-gray-200 ml-2">{author.username}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-secondary/50 pt-4 mb-6">
                    <h4 className="text-lg font-heading text-white mb-3">Interactions</h4>
                    <div className="flex gap-6">
                      <div className="flex items-center">
                        <Heart className="h-5 w-5 text-accent mr-2" />
                        <span className="text-gray-300">12</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-highlight mr-2" />
                        <span className="text-gray-300">{comments?.length || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Bookmark className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-300">8</span>
                      </div>
                    </div>
                  </div>
                  
                  {story.audioUrl && (
                    <div className="border-t border-secondary/50 pt-4">
                      <h4 className="text-lg font-heading text-white mb-3">Audio Version</h4>
                      <Button 
                        onClick={toggleAudio} 
                        className="w-full bg-accent hover:bg-red-900"
                      >
                        {isPlaying ? (
                          <>
                            <Volume2 className="mr-2 h-5 w-5" /> Pause Narration
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-5 w-5" /> Listen to Story
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
