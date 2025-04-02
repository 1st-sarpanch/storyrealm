import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { 
  ChevronRight, 
  MessageSquare, 
  Heart, 
  Share2, 
  Search, 
  PenTool, 
  Clock, 
  Trophy, 
  Calendar, 
  Users, 
  Loader2 
} from 'lucide-react';
import { COMMUNITY_TOPICS, PROMPT_CATEGORIES, DIFFICULTY_LEVELS } from '@/lib/constants';

// Community discussion post type
interface CommunityPost {
  id: number;
  author: {
    name: string;
    role: string;
    avatar: string;
    timeAgo: string;
  };
  title: string;
  content: string;
  topic: string;
  stats: {
    likes: number;
    comments: number;
  };
}

// Writing challenge type
interface WritingChallenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  deadline: string;
  participants: number;
}

// Writing prompt type
interface WritingPrompt {
  id: number;
  text: string;
  category: string;
  author: string;
  likes: number;
}

// Sample community posts for demonstration
const communityPosts: CommunityPost[] = [
  {
    id: 1,
    author: {
      name: "Jonathan Lee",
      role: "Fantasy Writer",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100&q=80",
      timeAgo: "3 days ago"
    },
    title: "Finding Inspiration in Ancient Myths",
    content: "I've been exploring Norse mythology for my next fantasy series and the wealth of characters and conflicts is astounding! Anyone else draw from mythology?",
    topic: "Writing Tips",
    stats: {
      likes: 24,
      comments: 8
    }
  },
  {
    id: 2,
    author: {
      name: "Sophia Williams",
      role: "Horror Author",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&h=100&q=80",
      timeAgo: "1 week ago"
    },
    title: "Tips for Creating Atmospheric Horror",
    content: "Just published my guide on creating immersive horror atmospheres. Focus on sensory details and psychological tension rather than just gore!",
    topic: "Writing Tips",
    stats: {
      likes: 56,
      comments: 17
    }
  },
  {
    id: 3,
    author: {
      name: "Thomas Rivera",
      role: "Sci-Fi Enthusiast",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80",
      timeAgo: "2 days ago"
    },
    title: "Writer's Block: Quantum Edition",
    content: "Stuck on my time travel story. How do you handle paradoxes in your sci-fi writing without confusing readers? Any techniques to share?",
    topic: "Story Ideas",
    stats: {
      likes: 19,
      comments: 23
    }
  },
  {
    id: 4,
    author: {
      name: "Aisha Patel",
      role: "Romance Writer",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
      timeAgo: "5 days ago"
    },
    title: "Character Development in Romance",
    content: "How do you create realistic character growth in romance stories without falling into predictable patterns? Looking for fresh approaches.",
    topic: "Character Development",
    stats: {
      likes: 31,
      comments: 12
    }
  }
];

// Sample writing challenges
const writingChallenges: WritingChallenge[] = [
  {
    id: 1,
    title: "Dark Fantasy Mini-Epic",
    description: "Write a dark fantasy story of exactly 1,000 words featuring a morally ambiguous protagonist and an ancient curse.",
    difficulty: "Intermediate",
    deadline: "7 days remaining",
    participants: 47
  },
  {
    id: 2,
    title: "Horror in 500 Words",
    description: "Create a horror story in exactly 500 words that takes place in a single room with a single character.",
    difficulty: "Advanced",
    deadline: "3 days remaining",
    participants: 86
  },
  {
    id: 3,
    title: "Science Fiction Flash Fiction",
    description: "Write a sci-fi story in exactly 300 words that explores a new technology and its unexpected consequences.",
    difficulty: "Beginner",
    deadline: "10 days remaining",
    participants: 32
  }
];

// Sample writing prompts
const writingPrompts: WritingPrompt[] = [
  {
    id: 1,
    text: "A forgotten library where books whisper their stories at night.",
    category: "Fantasy",
    author: "Elena Wright",
    likes: 42
  },
  {
    id: 2,
    text: "The last human on Earth receives a text message.",
    category: "Horror",
    author: "Marcus Black",
    likes: 67
  },
  {
    id: 3,
    text: "A detective who can communicate with shadows investigates a crime in a city of eternal darkness.",
    category: "Mystery",
    author: "Olivia Chen",
    likes: 38
  }
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTopic, setNewPostTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = 'Community - StoryVerse';
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  // Filter posts based on search term and selected topic
  const filteredPosts = communityPosts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTopic = selectedTopic === null || post.topic === selectedTopic;
    
    return matchesSearch && matchesTopic;
  });

  // Handle creating a new post
  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostTopic) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCreatingPost(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostTopic('');
      
      toast({
        title: "Post created!",
        description: "Your post has been published successfully",
      });
    }, 1000);
  };

  // Handle joining a challenge
  const handleJoinChallenge = (challengeId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join challenges",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Challenge joined!",
      description: "You've successfully joined the writing challenge",
    });
  };

  // Handle liking a prompt
  const handleLikePrompt = (promptId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like prompts",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Prompt liked!",
      description: "The prompt has been added to your favorites",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold text-white mb-4">
            StoryVerse <span className="text-highlight">Community</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Connect with fellow storytellers, share ideas, participate in challenges, and find inspiration for your next masterpiece.
          </p>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-neutral border-secondary">
              <CardHeader>
                <CardTitle className="text-highlight text-xl">Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Button
                      variant={selectedTopic === null ? "secondary" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedTopic(null)}
                    >
                      All Topics
                    </Button>
                  </li>
                  {COMMUNITY_TOPICS.map(topic => (
                    <li key={topic}>
                      <Button
                        variant={selectedTopic === topic ? "secondary" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedTopic(topic)}
                      >
                        {topic}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-accent hover:bg-red-900"
                  onClick={() => setIsCreatingPost(true)}
                >
                  <PenTool className="mr-2 h-4 w-4" /> Start New Discussion
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="discussions" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  <TabsTrigger value="challenges">Writing Challenges</TabsTrigger>
                  <TabsTrigger value="prompts">Writing Prompts</TabsTrigger>
                </TabsList>
                
                <div className="relative w-64 hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-primary/30 border-secondary"
                  />
                </div>
              </div>
              
              {/* Search on Mobile */}
              <div className="relative w-full mb-6 md:hidden">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-primary/30 border-secondary"
                />
              </div>
              
              {/* New Post Form */}
              {isCreatingPost && (
                <Card className="bg-neutral border-secondary mb-6">
                  <CardHeader>
                    <CardTitle className="text-highlight">Create New Post</CardTitle>
                    <CardDescription>Share your thoughts with the community</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Input
                        placeholder="Title"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="bg-primary/30 border-secondary mb-4"
                      />
                      <Textarea
                        placeholder="Write your post here..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="bg-primary/30 border-secondary min-h-32 mb-4"
                      />
                      <select
                        value={newPostTopic}
                        onChange={(e) => setNewPostTopic(e.target.value)}
                        className="w-full bg-primary/30 border-secondary rounded-md px-3 py-2 text-gray-300"
                      >
                        <option value="">Select a topic</option>
                        {COMMUNITY_TOPICS.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreatingPost(false)}
                      className="border-secondary"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={isSubmitting}
                      className="bg-highlight hover:bg-accent"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Posting...
                        </>
                      ) : (
                        <>Post</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Discussions Tab */}
              <TabsContent value="discussions" className="mt-0">
                {filteredPosts.length > 0 ? (
                  <div className="space-y-6">
                    {filteredPosts.map(post => (
                      <Card key={post.id} className="bg-neutral border-secondary hover:border-highlight transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            <Avatar className="w-10 h-10 border-2 border-highlight">
                              <AvatarImage src={post.author.avatar} alt={post.author.name} />
                              <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <h4 className="font-medium text-gray-200">{post.author.name}</h4>
                              <p className="text-xs text-gray-400">{post.author.role} • {post.author.timeAgo}</p>
                            </div>
                            <Badge className="ml-auto bg-secondary/50 text-gray-300">
                              {post.topic}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-heading text-highlight mb-2">{post.title}</h3>
                          <p className="text-gray-300 text-sm mb-4">
                            {post.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button className="flex items-center text-gray-400 hover:text-highlight transition">
                                <Heart className="mr-1 h-4 w-4" /> <span>{post.stats.likes}</span>
                              </button>
                              <button className="flex items-center text-gray-400 hover:text-highlight transition">
                                <MessageSquare className="mr-1 h-4 w-4" /> <span>{post.stats.comments}</span>
                              </button>
                            </div>
                            <button className="text-gray-400 hover:text-highlight transition">
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-neutral border-secondary">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-400 py-8">
                        {searchTerm || selectedTopic 
                          ? "No discussions match your search criteria." 
                          : "No discussions yet. Be the first to start one!"}
                      </p>
                      <Button 
                        onClick={() => setIsCreatingPost(true)}
                        className="bg-highlight hover:bg-accent"
                      >
                        Start a New Discussion
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Writing Challenges Tab */}
              <TabsContent value="challenges" className="mt-0">
                <div className="space-y-6">
                  {writingChallenges.map(challenge => (
                    <Card key={challenge.id} className="bg-neutral border-secondary hover:border-highlight transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <Badge className="bg-accent text-white">
                            {challenge.difficulty}
                          </Badge>
                          <div className="ml-auto flex items-center text-gray-400 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{challenge.deadline}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-heading text-highlight mb-2">{challenge.title}</h3>
                        <p className="text-gray-300 text-sm mb-6">
                          {challenge.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-400 text-sm">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{challenge.participants} participants</span>
                          </div>
                          <Button 
                            onClick={() => handleJoinChallenge(challenge.id)}
                            className="bg-highlight hover:bg-accent"
                          >
                            <Trophy className="mr-2 h-4 w-4" /> Join Challenge
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="text-center mt-8">
                    <Button className="bg-accent hover:bg-red-900">
                      View All Challenges
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Writing Prompts Tab */}
              <TabsContent value="prompts" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {writingPrompts.map(prompt => (
                    <Card key={prompt.id} className="bg-neutral border-secondary hover:border-highlight transition-colors">
                      <CardContent className="p-6">
                        <Badge className="bg-secondary/50 text-gray-300 mb-4">
                          {prompt.category}
                        </Badge>
                        <p className="text-lg text-gray-200 mb-6 italic">
                          "{prompt.text}"
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-400">
                            Submitted by <span className="text-highlight">{prompt.author}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              className="flex items-center text-gray-400 hover:text-highlight transition"
                              onClick={() => handleLikePrompt(prompt.id)}
                            >
                              <Heart className="mr-1 h-4 w-4" /> <span>{prompt.likes}</span>
                            </button>
                            <Link href="/write">
                              <Button size="sm" className="bg-highlight hover:bg-accent">
                                Use Prompt <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Card className="bg-neutral border-secondary mt-8">
                  <CardHeader>
                    <CardTitle className="text-highlight">Submit Your Prompt</CardTitle>
                    <CardDescription>Inspire others with your creative prompt</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Write your prompt here..."
                      className="bg-primary/30 border-secondary min-h-24"
                    />
                    <select
                      className="w-full bg-primary/30 border-secondary rounded-md px-3 py-2 text-gray-300"
                    >
                      <option value="">Select a category</option>
                      {PROMPT_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button className="bg-highlight hover:bg-accent">
                      Submit Prompt
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Calendar Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-heading font-bold text-gray-100 mb-8">
            <span className="text-highlight">Upcoming</span> Events
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-neutral border-secondary">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-highlight mr-2" />
                  <span className="text-gray-400">October 15, 2023</span>
                </div>
                <h3 className="text-xl font-heading text-highlight mb-2">Horror Writing Workshop</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Learn techniques for building tension and creating memorable horror scenes.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Virtual Event</span>
                  <Button size="sm" className="bg-highlight hover:bg-accent">
                    Join Event
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-neutral border-secondary">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-highlight mr-2" />
                  <span className="text-gray-400">October 22, 2023</span>
                </div>
                <h3 className="text-xl font-heading text-highlight mb-2">Author Q&A: Fantasy Worldbuilding</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Live session with bestselling author discussing the art of creating immersive fantasy worlds.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Live Stream</span>
                  <Button size="sm" className="bg-highlight hover:bg-accent">
                    Set Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-neutral border-secondary">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-highlight mr-2" />
                  <span className="text-gray-400">November 5, 2023</span>
                </div>
                <h3 className="text-xl font-heading text-highlight mb-2">StoryVerse Writing Competition</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Annual competition with prizes for best stories across all genres. Submission deadline.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Online Entry</span>
                  <Button size="sm" className="bg-highlight hover:bg-accent">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
