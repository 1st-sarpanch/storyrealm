import { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

// Form schemas
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Create form instances
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });
  
  // Handle login submission
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
    });
  };
  
  // Handle registration submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      username: values.username,
      email: values.email || undefined,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });
  };
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Set page title
  useEffect(() => {
    document.title = 'Sign In - StoryVerse';
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Auth Form */}
            <div className="bg-neutral p-8 rounded-xl shadow-2xl border border-secondary">
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-heading font-bold text-highlight mb-2">
                  Welcome to StoryVerse
                </h1>
                <p className="text-gray-400">
                  {activeTab === 'login' 
                    ? 'Sign in to continue your storytelling journey' 
                    : 'Create an account to begin your storytelling journey'}
                </p>
              </div>
              
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                {...field} 
                                className="bg-primary/30 border-secondary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                                className="bg-primary/30 border-secondary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="remember" 
                            className="mr-2 bg-primary/30 border-secondary"
                          />
                          <label htmlFor="remember" className="text-gray-400 text-sm">
                            Remember me
                          </label>
                        </div>
                        <a href="#" className="text-highlight hover:text-accent text-sm">
                          Forgot password?
                        </a>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-6 bg-accent hover:bg-red-900"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Signing In...
                          </>
                        ) : 'Sign In'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                {...field} 
                                className="bg-primary/30 border-secondary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Your email address" 
                                {...field} 
                                className="bg-primary/30 border-secondary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                {...field} 
                                className="bg-primary/30 border-secondary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm your password" 
                                {...field} 
                                className="bg-primary/30 border-secondary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-6 bg-accent hover:bg-red-900"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Creating Account...
                          </>
                        ) : 'Create Account'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-8 pt-6 border-t border-secondary/50">
                <p className="text-center text-gray-400 text-sm mb-4">Or sign in with</p>
                <div className="flex justify-center gap-4">
                  <button className="p-2 bg-[#3b5998] rounded text-white hover:opacity-90 transition">
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button className="p-2 bg-[#1da1f2] rounded text-white hover:opacity-90 transition">
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button className="p-2 bg-[#db4437] rounded text-white hover:opacity-90 transition">
                    <i className="fab fa-google"></i>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Hero Content */}
            <div className="hidden lg:block relative rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1585681614757-b7ad176ed009?auto=format&fit=crop&w=800&h=800&q=80" 
                alt="Dark Fantasy" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-primary/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <h2 className="text-4xl font-accent text-highlight mb-4">Enter the Realm</h2>
                <p className="text-xl text-gray-300 mb-6 max-w-md">
                  Discover a universe of captivating stories, from ancient myths to futuristic adventures. Share your own tales and connect with fellow storytellers.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-accent/50 rounded-full text-white text-sm">Fantasy</span>
                  <span className="px-3 py-1 bg-accent/50 rounded-full text-white text-sm">Horror</span>
                  <span className="px-3 py-1 bg-accent/50 rounded-full text-white text-sm">Science Fiction</span>
                  <span className="px-3 py-1 bg-accent/50 rounded-full text-white text-sm">Detective</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
