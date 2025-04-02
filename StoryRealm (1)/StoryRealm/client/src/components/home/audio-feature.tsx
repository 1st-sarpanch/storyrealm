import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Mic, Check } from 'lucide-react';

export function AudioFeature() {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-50"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="lg:flex items-center gap-12">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h2 className="text-4xl font-heading font-bold text-gray-100 mb-6">
              Tell Your <span className="text-highlight">Story</span> With Your <span className="text-accent">Voice</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Bring your stories to life with our audio recording feature. Capture the perfect narration and share it with the world.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="text-highlight mt-1 mr-3 h-5 w-5" />
                <div>
                  <h4 className="font-heading text-white text-lg">Simple Recording</h4>
                  <p className="text-gray-300">Record directly from your browser with one click</p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="text-highlight mt-1 mr-3 h-5 w-5" />
                <div>
                  <h4 className="font-heading text-white text-lg">Background Music</h4>
                  <p className="text-gray-300">Add ambient sounds to enhance your storytelling</p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="text-highlight mt-1 mr-3 h-5 w-5" />
                <div>
                  <h4 className="font-heading text-white text-lg">Share & Download</h4>
                  <p className="text-gray-300">Share your audio stories or download them for later</p>
                </div>
              </li>
            </ul>
            <Link href="/write">
              <Button 
                className="px-8 py-3 bg-accent hover:bg-red-900 text-white rounded-lg font-body font-semibold transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <Mic className="mr-2 h-5 w-5" /> Start Recording
              </Button>
            </Link>
          </div>
          
          <div className="lg:w-1/2">
            <div className="bg-neutral p-6 rounded-xl shadow-2xl border border-secondary">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading text-highlight">Audio Storyteller</h3>
                <div className="flex gap-3">
                  <button className="text-gray-400 hover:text-gray-200 transition">
                    <i className="fas fa-cog"></i>
                  </button>
                  <button className="text-gray-400 hover:text-gray-200 transition">
                    <i className="fas fa-question-circle"></i>
                  </button>
                </div>
              </div>
              
              <div className="bg-primary/50 rounded-lg p-4 mb-6 border border-secondary">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-gray-300 font-body">
                    <span className="text-highlight font-medium">The Enchanted Forest</span>
                    <span className="text-sm ml-2">by Alex Morgan</span>
                  </div>
                  <span className="text-xs text-gray-400">00:28 / 02:45</span>
                </div>
                
                <div className="relative mb-4">
                  <div className="h-2 bg-secondary rounded-full">
                    <div className="h-full bg-highlight rounded-full w-1/5 relative">
                      <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-highlight rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="audio-visualizer playing mx-auto mb-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="audio-bar"></div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center gap-6">
                  <button className="text-gray-400 hover:text-highlight transition">
                    <i className="fas fa-step-backward"></i>
                  </button>
                  <button className="text-gray-400 hover:text-highlight transition">
                    <i className="fas fa-backward"></i>
                  </button>
                  <button className="w-12 h-12 bg-highlight rounded-full flex items-center justify-center text-neutral hover:bg-accent transition">
                    <i className="fas fa-pause"></i>
                  </button>
                  <button className="text-gray-400 hover:text-highlight transition">
                    <i className="fas fa-forward"></i>
                  </button>
                  <button className="text-gray-400 hover:text-highlight transition">
                    <i className="fas fa-step-forward"></i>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-heading text-gray-200">Your Recordings</h4>
                <button className="text-xs text-highlight hover:text-accent transition">View All</button>
              </div>
              
              <div className="bg-secondary/30 p-3 rounded-lg mb-3 hover:bg-secondary/50 transition cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-200">The Dark Tower</h5>
                    <p className="text-xs text-gray-400">Recorded 2 days ago • 3:24</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="text-gray-400 hover:text-highlight transition">
                      <i className="fas fa-play"></i>
                    </button>
                    <button className="text-gray-400 hover:text-highlight transition">
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary/30 p-3 rounded-lg hover:bg-secondary/50 transition cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-200">Whispers of Magic</h5>
                    <p className="text-xs text-gray-400">Recorded 1 week ago • 5:12</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="text-gray-400 hover:text-highlight transition">
                      <i className="fas fa-play"></i>
                    </button>
                    <button className="text-gray-400 hover:text-highlight transition">
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
