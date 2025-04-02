import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedStories } from '@/components/home/featured-stories';
import { GenresSection } from '@/components/home/genres-section';
import { AudioFeature } from '@/components/home/audio-feature';
import { WritingSection } from '@/components/home/writing-section';
import { CommunitySection } from '@/components/home/community-section';
import { CallToAction } from '@/components/home/call-to-action';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Set page title
    document.title = 'StoryVerse - Immerse Yourself in Tales';
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturedStories />
        <GenresSection />
        <AudioFeature />
        <WritingSection />
        <CommunitySection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
