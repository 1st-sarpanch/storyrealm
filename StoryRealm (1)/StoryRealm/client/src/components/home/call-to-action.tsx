import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export function CallToAction() {
  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-75"></div>
      
      <div className="container mx-auto relative z-10 text-center">
        <h2 className="text-5xl font-heading font-bold text-white mb-6 max-w-3xl mx-auto">
          Begin Your <span className="text-highlight">Storytelling</span> Journey Today
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Join thousands of writers and readers in our magical community. Share your stories, find new favorites, and connect with fellow storytellers.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/auth">
            <Button 
              size="lg"
              className="px-8 py-4 bg-accent hover:bg-red-900 text-white rounded-lg font-body font-semibold transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Sign Up Now
            </Button>
          </Link>
          <Link href="/#genres">
            <Button 
              size="lg"
              variant="outline"
              className="px-8 py-4 bg-transparent border-2 border-highlight text-highlight rounded-lg font-body font-semibold hover:bg-highlight hover:text-neutral transition-all duration-300 text-lg"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
