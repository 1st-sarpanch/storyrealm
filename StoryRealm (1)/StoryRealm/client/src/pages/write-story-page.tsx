import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Genre } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AudioRecorder } from '@/components/ui/audio-recorder';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Save, BookmarkPlus } from 'lucide-react';

// Form validation schema
const storySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(500, 'Summary is too long'),
  genreId: z.string().min(1, 'Please select a genre'),
  coverImage: z.string().optional(),
  tags: z.string().optional(), // For tags input (comma-separated)
});

type StoryFormValues = z.infer<typeof storySchema>;

export default function WriteStoryPage() {
  const [content, setContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('write');
  const [savingStatus, setSavingStatus] = useState('');
  const [, navigate] = useLocation();

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up form
  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      summary: '',
      genreId: '',
      coverImage: '',
      tags: ''
    }
  });

  // Fetch genres for dropdown
  const { data: genres, isLoading: isGenresLoading } = useQuery<Genre[]>({
    queryKey: ['/api/genres'],
  });

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/stories', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to create story');
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      
      toast({
        title: "Story created!",
        description: "Your story has been submitted successfully",
      });
      
      // Navigate to the new story page
      navigate(`/story/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = async (values: StoryFormValues) => {
    if (!content || content.length < 50) {
      toast({
        title: "Content too short",
        description: "Your story content must be at least 50 characters long",
        variant: "destructive",
      });
      return;
    }
    
    // Create FormData to handle text and binary data
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('summary', values.summary);
    formData.append('genreId', values.genreId);
    formData.append('content', content);
    formData.append('isUserSubmitted', 'true');
    
    // Add cover image if provided
    if (values.coverImage) {
      formData.append('coverImage', values.coverImage);
    }
    
    // Add audio if recorded
    if (audioBlob) {
      formData.append('audio', audioBlob);
    }
    
    // Process tags if provided
    if (values.tags) {
      // Split by comma, trim whitespace, and filter out empty tags
      const tagsArray = values.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Add tags as JSON string to form data
      formData.append('tags', JSON.stringify(tagsArray));
    }
    
    setSavingStatus('saving');
    createStoryMutation.mutate(formData);
  };

  // Handle content changes from the rich text editor
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSavingStatus('saved');
  };

  // Handle audio recording save
  const handleAudioSave = (blob: Blob) => {
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));
    setSavingStatus('saved');
    
    toast({
      title: "Audio saved",
      description: "Your recording has been saved with your story",
    });
  };

  // Set page title
  useEffect(() => {
    document.title = 'Write a Story - StoryVerse';
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
    
    // Clean up audio URL when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-neutral border-secondary shadow-2xl mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-heading text-highlight">
                Write Your Story
              </CardTitle>
              <CardDescription>
                Create, edit, and publish your own story to share with the StoryVerse community
              </CardDescription>
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      {/* Story Details */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Story Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter a captivating title..." 
                                  className="bg-primary/30 border-secondary"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="summary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Summary</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Provide a brief summary of your story..." 
                                  className="bg-primary/30 border-secondary"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="genreId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Genre</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-primary/30 border-secondary">
                                    <SelectValue placeholder="Select a genre" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isGenresLoading ? (
                                    <div className="flex justify-center p-2">
                                      <Loader2 className="h-5 w-5 animate-spin text-highlight" />
                                    </div>
                                  ) : genres?.map(genre => (
                                    <SelectItem key={genre.id} value={genre.id.toString()}>
                                      {genre.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="coverImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cover Image URL (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter an image URL for your story cover..." 
                                  className="bg-primary/30 border-secondary"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter tags separated by commas (fantasy, adventure, magic...)" 
                                  className="bg-primary/30 border-secondary"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-400">Tags help readers find your story more easily</p>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Card className="bg-primary/30 border-secondary h-full">
                        <CardHeader>
                          <CardTitle className="text-xl font-heading text-highlight">
                            Publishing Guidelines
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-300">
                          <p>
                            <span className="font-bold">Content:</span> Your story should be original and not infringe on copyrights.
                          </p>
                          <p>
                            <span className="font-bold">Length:</span> While there's no strict limit, stories between 1,000-10,000 words tend to perform best.
                          </p>
                          <p>
                            <span className="font-bold">Quality:</span> Proofread your work for grammar and spelling errors.
                          </p>
                          <p>
                            <span className="font-bold">Audio:</span> Recording audio is optional but enhances the reader experience.
                          </p>
                          <p>
                            <span className="font-bold">Review:</span> All user submissions are reviewed before being publicly displayed.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  {/* Content Editor Tabs */}
                  <div className="mt-8">
                    <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="write">Write Story</TabsTrigger>
                        <TabsTrigger value="audio">Record Audio</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="write" className="mt-0">
                        <RichTextEditor
                          initialValue={content}
                          onSave={handleContentChange}
                          wordCount={true}
                          placeholder="Once upon a time in a land far away..."
                        />
                      </TabsContent>
                      
                      <TabsContent value="audio" className="mt-0">
                        <AudioRecorder
                          onSave={handleAudioSave}
                          existingAudioUrl={audioUrl || undefined}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    {savingStatus === 'saved' && 'All changes saved'}
                    {savingStatus === 'saving' && 'Saving changes...'}
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="border-secondary text-gray-300"
                      onClick={() => navigate('/')}
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={createStoryMutation.isPending}
                      className="bg-highlight hover:bg-accent text-white"
                    >
                      {createStoryMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Submitting...
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="mr-2 h-4 w-4" /> Publish Story
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
