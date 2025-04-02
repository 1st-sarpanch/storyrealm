import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown, Search, User, LogOut, Settings, PenTool } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Genres', path: '#genres' },
    { name: 'Real Stories', path: '/real-stories' },
    { name: 'Write', path: '/write' },
    { name: 'Community', path: '/community' },
  ];

  const logout = () => {
    logoutMutation.mutate();
  };

  const handleMobileLink = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-neutral/90 backdrop-blur-sm' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-4 py-6 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-4xl font-accent text-highlight tracking-wider flex items-center">
            <span className="animate-float">StoryVerse</span>
            <i className="fas fa-book-open ml-3 text-accent"></i>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden border rounded text-gray-300 border-gray-400 hover:text-highlight hover:border-highlight"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`text-gray-300 hover:text-highlight transition-colors duration-300 font-body ${
                location === link.path ? 'text-highlight' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-300 hover:text-highlight transition-colors duration-300 font-body">
                <span>Account</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 rounded-md shadow-lg py-1 bg-neutral border border-secondary">
              {user ? (
                <>
                  <DropdownMenuLabel className="px-4 py-2 text-sm text-gray-300">
                    Signed in as <span className="font-bold text-highlight">{user.username}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-secondary/50" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-secondary hover:text-highlight">
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/write" className="block px-4 py-2 text-sm text-gray-300 hover:bg-secondary hover:text-highlight">
                        <PenTool className="mr-2 h-4 w-4" /> Write Story
                      </Link>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-secondary hover:text-highlight">
                          <Settings className="mr-2 h-4 w-4" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-secondary/50" />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-secondary hover:text-highlight cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth" className="block px-4 py-2 text-sm text-gray-300 hover:bg-secondary hover:text-highlight">
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth" className="block px-4 py-2 text-sm text-gray-300 hover:bg-secondary hover:text-highlight">
                      Register
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Search button */}
        <Button 
          variant="secondary"
          size="icon"
          className="p-2 rounded-full bg-secondary hover:bg-accent transition-colors duration-300"
        >
          <Search className="h-5 w-5 text-gray-200" />
        </Button>
      </nav>
      
      {/* Mobile Navigation (Hidden by default) */}
      <div className={`md:hidden bg-neutral border-t border-secondary transition-all duration-300 ${mobileMenuOpen ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-highlight hover:bg-secondary ${
                location === link.path ? 'text-highlight bg-secondary/50' : ''
              }`}
              onClick={handleMobileLink}
            >
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <>
              <div className="px-3 py-2 text-sm font-medium text-gray-400">
                Signed in as <span className="text-highlight">{user.username}</span>
              </div>
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-highlight hover:bg-secondary"
                onClick={handleMobileLink}
              >
                Profile
              </Link>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-highlight hover:bg-secondary"
                  onClick={handleMobileLink}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  handleMobileLink();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-highlight hover:bg-secondary"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-highlight hover:bg-secondary"
                onClick={handleMobileLink}
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-highlight hover:bg-secondary"
                onClick={handleMobileLink}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
