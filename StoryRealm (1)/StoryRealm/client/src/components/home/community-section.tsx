import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Share2 } from 'lucide-react';

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
  stats: {
    likes: number;
    comments: number;
  };
}

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
    stats: {
      likes: 19,
      comments: 23
    }
  }
];

export function CommunitySection() {
  return (
    <section id="community" className="py-16 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-neutral to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto relative z-10">
        <h2 className="text-4xl font-heading font-bold text-center text-gray-100 mb-4">
          Join Our <span className="text-highlight">Community</span> of Storytellers
        </h2>
        <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
          Connect with fellow writers and readers who share your passion for stories.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communityPosts.map(post => (
            <div 
              key={post.id} 
              className="bg-neutral rounded-lg overflow-hidden border border-secondary transition-transform duration-300 hover:scale-105 hover:shadow-highlight/20 shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-10 h-10 rounded-full border-2 border-highlight">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-200">{post.author.name}</h4>
                    <p className="text-xs text-gray-400">{post.author.role} • {post.author.timeAgo}</p>
                  </div>
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
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/community">
            <Button 
              className="px-8 py-3 bg-transparent border-2 border-highlight text-highlight rounded-lg font-body font-semibold hover:bg-highlight hover:text-neutral transition-all duration-300"
            >
              Join the Conversation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
