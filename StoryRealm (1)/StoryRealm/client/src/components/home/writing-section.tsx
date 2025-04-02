import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { Check } from "lucide-react";

export function WritingSection() {
  return (
    <section id="write" className="py-16 px-4">
      <div className="container mx-auto">
        <div className="lg:flex items-center gap-12">
          <div className="lg:w-1/2 mb-10 lg:mb-0 order-2 lg:order-1">
            <div className="bg-neutral p-6 rounded-xl shadow-2xl border border-secondary">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                  <button className="w-3 h-3 rounded-full bg-red-500"></button>
                  <button className="w-3 h-3 rounded-full bg-yellow-500"></button>
                  <button className="w-3 h-3 rounded-full bg-green-500"></button>
                </div>
                <div className="flex gap-3">
                  <button className="text-gray-400 hover:text-gray-200 transition">
                    <i className="fas fa-save"></i>
                  </button>
                  <button className="text-gray-400 hover:text-gray-200 transition">
                    <i className="fas fa-cog"></i>
                  </button>
                </div>
              </div>
              
              <div className="bg-primary/50 rounded-lg p-4 mb-6 border border-secondary h-64 overflow-y-auto scrollbar-custom">
                <h3 className="text-xl font-heading text-highlight mb-4">The Forgotten Kingdom</h3>
                <p className="text-gray-300 leading-relaxed">
                  In the shadow of the ancient mountains, where mist clung to the valleys like spectral fingers, there stood a forgotten kingdom. Its towers, once gleaming with the light of a thousand torches, now stood in crumbling silence against the twilight sky.
                </p>
                <p className="text-gray-300 leading-relaxed mt-3">
                  Elara placed her hand on the cold stone of the gateway, feeling the remnants of magic that still pulsed beneath its surface. The stories her grandmother had told her were true - this place had not always been abandoned.
                </p>
                <p className="text-gray-300 leading-relaxed mt-3">
                  "What secrets do you hold?" she whispered to the wind, her words carrying into the emptiness beyond the gate.
                </p>
                <p className="text-gray-300 leading-relaxed mt-3">
                  The silence that answered her was broken only by the soft flutter of wings as a raven landed on a nearby stone, its eyes reflecting wisdom beyond mortal understanding...
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <button className="bg-secondary/30 hover:bg-secondary/50 transition px-3 py-1 rounded text-sm text-gray-200">
                  <i className="fas fa-heading mr-1"></i> Heading
                </button>
                <button className="bg-secondary/30 hover:bg-secondary/50 transition px-3 py-1 rounded text-sm text-gray-200">
                  <i className="fas fa-bold mr-1"></i> Bold
                </button>
                <button className="bg-secondary/30 hover:bg-secondary/50 transition px-3 py-1 rounded text-sm text-gray-200">
                  <i className="fas fa-italic mr-1"></i> Italic
                </button>
                <button className="bg-secondary/30 hover:bg-secondary/50 transition px-3 py-1 rounded text-sm text-gray-200">
                  <i className="fas fa-quote-right mr-1"></i> Quote
                </button>
                <button className="bg-secondary/30 hover:bg-secondary/50 transition px-3 py-1 rounded text-sm text-gray-200">
                  <i className="fas fa-list mr-1"></i> List
                </button>
                <button className="bg-secondary/30 hover:bg-secondary/50 transition px-3 py-1 rounded text-sm text-gray-200">
                  <i className="fas fa-image mr-1"></i> Image
                </button>
              </div>
              
              <div className="flex justify-between">
                <div className="text-xs text-gray-400">
                  <span>Words: 102</span>
                  <span className="ml-3">Auto-saved 2 mins ago</span>
                </div>
                <div className="flex gap-3">
                  <button className="bg-secondary hover:bg-secondary/80 transition px-4 py-2 rounded text-sm text-gray-200">
                    Preview
                  </button>
                  <button className="bg-highlight hover:bg-accent transition px-4 py-2 rounded text-sm text-neutral font-medium">
                    Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 order-1 lg:order-2">
            <h2 className="text-4xl font-heading font-bold text-gray-100 mb-6">
              Unleash Your <span className="text-highlight">Imagination</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Write and share your own stories with our intuitive editor. From epic fantasies to spine-tingling horror, your creative journey begins here.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="text-highlight mt-1 mr-3 h-5 w-5" />
                <div>
                  <h4 className="font-heading text-white text-lg">Powerful Editor</h4>
                  <p className="text-gray-300">Format your stories with our easy-to-use tools</p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="text-highlight mt-1 mr-3 h-5 w-5" />
                <div>
                  <h4 className="font-heading text-white text-lg">Auto-Save</h4>
                  <p className="text-gray-300">Never lose your progress with automatic saving</p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="text-highlight mt-1 mr-3 h-5 w-5" />
                <div>
                  <h4 className="font-heading text-white text-lg">Publish & Share</h4>
                  <p className="text-gray-300">Share your stories with the StoryVerse community</p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="text-highlight mt-1 mr-3 h-5 w-5" />
                <div>
                  <h4 className="font-heading text-white text-lg">Reader Feedback</h4>
                  <p className="text-gray-300">Get comments and ratings from engaged readers</p>
                </div>
              </li>
            </ul>
            <Link href="/write">
              <Button 
                className="px-8 py-3 bg-accent hover:bg-red-900 text-white rounded-lg font-body font-semibold transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <PencilIcon className="mr-2 h-5 w-5" /> Start Writing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
