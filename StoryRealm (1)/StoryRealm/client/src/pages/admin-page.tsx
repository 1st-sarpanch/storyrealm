import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Story, Genre, User } from '@shared/schema';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Loader2, Eye, Check, X, Edit, Trash, 
  RotateCcw, Users, Book, FileText, MessageSquare, 
  Tag, Flag, BarChart2, Image, Paintbrush, Settings,
  ChevronRight, ChevronLeft, Search
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeStoryId, setActiveStoryId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If not admin, redirect to home
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  // Set page title
  useEffect(() => {
    document.title = 'Admin Dashboard - StoryVerse';
  }, []);

  // Fetch pending stories
  const { 
    data: pendingStories, 
    isLoading: isPendingStoriesLoading 
  } = useQuery<Story[]>({
    queryKey: ['/api/admin/pending-stories'],
    enabled: !!user?.isAdmin,
  });

  // Fetch all stories
  const { 
    data: allStories, 
    isLoading: isAllStoriesLoading 
  } = useQuery<Story[]>({
    queryKey: ['/api/stories'],
    enabled: !!user?.isAdmin,
  });

  // Fetch all users
  const { 
    data: users, 
    isLoading: isUsersLoading 
  } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user?.isAdmin,
  });

  // Fetch genres
  const { 
    data: genres, 
    isLoading: isGenresLoading 
  } = useQuery<Genre[]>({
    queryKey: ['/api/genres'],
    enabled: !!user?.isAdmin,
  });

  // Approve/reject story mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ 
      storyId, isApproved 
    }: { 
      storyId: number; 
      isApproved: boolean 
    }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/admin/stories/${storyId}/approval`, 
        { isApproved }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-stories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      
      toast({
        title: "Story updated",
        description: "The story status has been updated successfully",
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

  // Delete story mutation
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      await apiRequest("DELETE", `/api/stories/${storyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-stories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      setDeleteDialogOpen(false);
      
      toast({
        title: "Story deleted",
        description: "The story has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle story approval
  const handleApproveStory = (storyId: number) => {
    approvalMutation.mutate({ storyId, isApproved: true });
  };

  // Handle story rejection
  const handleRejectStory = (storyId: number) => {
    approvalMutation.mutate({ storyId, isApproved: false });
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (storyId: number) => {
    setActiveStoryId(storyId);
    setDeleteDialogOpen(true);
  };

  // Handle story deletion
  const handleDeleteStory = () => {
    if (activeStoryId) {
      deleteStoryMutation.mutate(activeStoryId);
    }
  };

  // View story details
  const viewStory = (storyId: number) => {
    navigate(`/story/${storyId}`);
  };

  // Get username by ID
  const getUsernameById = (userId: number): string => {
    const foundUser = users?.find(user => user.id === userId);
    return foundUser ? foundUser.username : `User ${userId}`;
  };

  // Get genre name by ID
  const getGenreNameById = (genreId: number): string => {
    const foundGenre = genres?.find(genre => genre.id === genreId);
    return foundGenre ? foundGenre.name : `Genre ${genreId}`;
  };

  // Filter stories by search term
  const filterStories = (stories: Story[] | undefined) => {
    if (!stories) return [];
    
    return stories.filter(story => 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUsernameById(story.authorId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGenreNameById(story.genreId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Paginate stories
  const paginateStories = (stories: Story[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return stories.slice(startIndex, startIndex + itemsPerPage);
  };

  // Filtered and paginated stories
  const filteredPendingStories = filterStories(pendingStories);
  const paginatedPendingStories = paginateStories(filteredPendingStories);
  
  const filteredAllStories = filterStories(allStories);
  const paginatedAllStories = paginateStories(filteredAllStories);

  // Calculate total pages
  const totalPendingPages = Math.ceil((filteredPendingStories.length || 0) / itemsPerPage);
  const totalAllPages = Math.ceil((filteredAllStories.length || 0) / itemsPerPage);

  // Navigation between pages
  const goToNextPage = () => {
    if (activeTab === 'pending-stories' && currentPage < totalPendingPages) {
      setCurrentPage(currentPage + 1);
    } else if (activeTab === 'all-stories' && currentPage < totalAllPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset page when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  if (!user || !user.isAdmin) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-neutral border-secondary sticky top-24">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <Button
                    variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <BarChart2 className="mr-3 h-5 w-5" /> Dashboard
                  </Button>
                  <Button
                    variant={activeTab === 'pending-stories' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveTab('pending-stories')}
                  >
                    <FileText className="mr-3 h-5 w-5" /> Pending Stories
                  </Button>
                  <Button
                    variant={activeTab === 'all-stories' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveTab('all-stories')}
                  >
                    <Book className="mr-3 h-5 w-5" /> All Stories
                  </Button>
                  <Button
                    variant={activeTab === 'users' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="mr-3 h-5 w-5" /> Users
                  </Button>
                  <Button
                    variant={activeTab === 'genres' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveTab('genres')}
                  >
                    <Tag className="mr-3 h-5 w-5" /> Genres
                  </Button>
                  <Button
                    variant={activeTab === 'appearance' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveTab('appearance')}
                  >
                    <Paintbrush className="mr-3 h-5 w-5" /> Appearance
                  </Button>
                  <Button
                    variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="mr-3 h-5 w-5" /> Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-4">
            <Card className="bg-neutral border-secondary">
              <CardContent className="p-6">
                <Tabs defaultValue="dashboard" value={activeTab}>
                  {/* Dashboard Tab */}
                  <TabsContent value="dashboard" className="mt-0">
                    <h2 className="text-3xl font-heading text-highlight mb-6">
                      Admin Dashboard
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card className="bg-primary p-4 rounded-lg border border-secondary">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-400 text-sm">Total Stories</p>
                            <p className="text-2xl font-bold text-highlight">
                              {allStories?.length || 0}
                            </p>
                          </div>
                          <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center text-accent">
                            <Book className="h-5 w-5" />
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="bg-primary p-4 rounded-lg border border-secondary">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-400 text-sm">Active Users</p>
                            <p className="text-2xl font-bold text-highlight">
                              {users?.length || 0}
                            </p>
                          </div>
                          <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center text-accent">
                            <Users className="h-5 w-5" />
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="bg-primary p-4 rounded-lg border border-secondary">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-400 text-sm">New Submissions</p>
                            <p className="text-2xl font-bold text-highlight">
                              {pendingStories?.length || 0}
                            </p>
                          </div>
                          <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center text-accent">
                            <FileText className="h-5 w-5" />
                          </div>
                        </div>
                      </Card>
                    </div>
                    
                    <h3 className="text-xl font-heading text-white mb-4">Recent Submissions</h3>
                    {isPendingStoriesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-highlight" />
                      </div>
                    ) : pendingStories && pendingStories.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Author</TableHead>
                              <TableHead>Genre</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingStories.slice(0, 5).map(story => (
                              <TableRow key={story.id}>
                                <TableCell className="font-medium">{story.title}</TableCell>
                                <TableCell>{getUsernameById(story.authorId)}</TableCell>
                                <TableCell>{getGenreNameById(story.genreId)}</TableCell>
                                <TableCell>
                                  {new Date(story.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => viewStory(story.id)}
                                      title="View"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleApproveStory(story.id)}
                                      title="Approve"
                                      className="text-green-500"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleRejectStory(story.id)}
                                      title="Reject"
                                      className="text-red-500"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-6">
                        No pending submissions to review.
                      </p>
                    )}
                    
                    <div className="mt-6 text-center">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('pending-stories')}
                        className="border-highlight text-highlight"
                      >
                        View All Pending Stories
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Pending Stories Tab */}
                  <TabsContent value="pending-stories" className="mt-0">
                    <h2 className="text-3xl font-heading text-highlight mb-6">
                      Pending Stories
                    </h2>
                    
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input 
                          type="text"
                          placeholder="Search by title, author, or genre..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-primary/30 border-secondary"
                        />
                      </div>
                    </div>
                    
                    {isPendingStoriesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-highlight" />
                      </div>
                    ) : filteredPendingStories.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Author</TableHead>
                              <TableHead>Genre</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedPendingStories.map(story => (
                              <TableRow key={story.id}>
                                <TableCell className="font-medium">{story.title}</TableCell>
                                <TableCell>{getUsernameById(story.authorId)}</TableCell>
                                <TableCell>{getGenreNameById(story.genreId)}</TableCell>
                                <TableCell>
                                  {new Date(story.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => viewStory(story.id)}
                                      title="View"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleApproveStory(story.id)}
                                      title="Approve"
                                      className="text-green-500"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleRejectStory(story.id)}
                                      title="Reject"
                                      className="text-red-500"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-6">
                        {searchTerm ? 'No matching stories found.' : 'No pending stories to review.'}
                      </p>
                    )}
                    
                    {/* Pagination controls */}
                    {filteredPendingStories.length > 0 && (
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-400">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPendingStories.length)} of {filteredPendingStories.length} stories
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="border-secondary"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={goToNextPage}
                            disabled={currentPage >= totalPendingPages}
                            className="border-secondary"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* All Stories Tab */}
                  <TabsContent value="all-stories" className="mt-0">
                    <h2 className="text-3xl font-heading text-highlight mb-6">
                      All Stories
                    </h2>
                    
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input 
                          type="text"
                          placeholder="Search by title, author, or genre..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-primary/30 border-secondary"
                        />
                      </div>
                    </div>
                    
                    {isAllStoriesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-highlight" />
                      </div>
                    ) : filteredAllStories.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Author</TableHead>
                              <TableHead>Genre</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedAllStories.map(story => (
                              <TableRow key={story.id}>
                                <TableCell className="font-medium">{story.title}</TableCell>
                                <TableCell>{getUsernameById(story.authorId)}</TableCell>
                                <TableCell>{getGenreNameById(story.genreId)}</TableCell>
                                <TableCell>
                                  {story.isApproved ? (
                                    <span className="px-2 py-1 bg-green-600/30 text-green-400 rounded text-xs">
                                      Approved
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-yellow-600/30 text-yellow-400 rounded text-xs">
                                      Pending
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => viewStory(story.id)}
                                      title="View"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {/* Edit story logic */}}
                                      title="Edit"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => openDeleteDialog(story.id)}
                                      title="Delete"
                                      className="text-red-500"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-6">
                        {searchTerm ? 'No matching stories found.' : 'No stories available.'}
                      </p>
                    )}
                    
                    {/* Pagination controls */}
                    {filteredAllStories.length > 0 && (
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-400">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAllStories.length)} of {filteredAllStories.length} stories
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="border-secondary"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={goToNextPage}
                            disabled={currentPage >= totalAllPages}
                            className="border-secondary"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Users Tab */}
                  <TabsContent value="users" className="mt-0">
                    <h2 className="text-3xl font-heading text-highlight mb-6">
                      User Management
                    </h2>
                    
                    {isUsersLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-highlight" />
                      </div>
                    ) : users && users.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map(user => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>{user.email || 'N/A'}</TableCell>
                                <TableCell>
                                  {user.isAdmin ? (
                                    <span className="px-2 py-1 bg-accent/30 text-accent rounded text-xs">
                                      Admin
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-secondary/30 text-gray-300 rounded text-xs">
                                      User
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {/* View user profile */}}
                                      title="View Profile"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {/* Edit user */}}
                                      title="Edit"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-6">
                        No users found.
                      </p>
                    )}
                  </TabsContent>
                  
                  {/* Genres Tab */}
                  <TabsContent value="genres" className="mt-0">
                    <h2 className="text-3xl font-heading text-highlight mb-6">
                      Genre Management
                    </h2>
                    
                    {isGenresLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-highlight" />
                      </div>
                    ) : genres && genres.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Icon</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {genres.map(genre => (
                              <TableRow key={genre.id}>
                                <TableCell className="font-medium">{genre.name}</TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {genre.description}
                                </TableCell>
                                <TableCell>
                                  <i className={`${genre.icon || 'fas fa-book'} text-highlight`}></i>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {/* Edit genre */}}
                                      title="Edit"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-6">
                        No genres found.
                      </p>
                    )}
                  </TabsContent>
                  
                  {/* Appearance Tab */}
                  <TabsContent value="appearance" className="mt-0">
                    <h2 className="text-3xl font-heading text-highlight mb-6">
                      Appearance Settings
                    </h2>
                    
                    <p className="text-gray-300 mb-8">
                      Customize the appearance of the StoryVerse website.
                      This section allows you to change themes, colors, and other visual elements.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="bg-primary/30 border-secondary">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-heading text-highlight mb-4">Theme Colors</h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Primary Color</p>
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary border border-secondary"></div>
                                <div className="w-8 h-8 rounded-full bg-secondary border border-secondary"></div>
                                <div className="w-8 h-8 rounded-full bg-accent border border-secondary"></div>
                                <div className="w-8 h-8 rounded-full bg-highlight border border-secondary"></div>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Homepage Background</p>
                              <div className="h-20 rounded-md bg-gradient-to-r from-primary to-secondary opacity-50 border border-secondary"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-primary/30 border-secondary">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-heading text-highlight mb-4">Layout Options</h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Homepage Layout</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 border border-highlight rounded-md bg-primary/20">
                                  <div className="w-full h-4 bg-secondary/30 rounded mb-2"></div>
                                  <div className="w-3/4 h-4 bg-secondary/30 rounded mb-4"></div>
                                  <div className="w-full h-12 bg-secondary/30 rounded"></div>
                                </div>
                                <div className="p-2 border border-secondary rounded-md bg-primary/20">
                                  <div className="w-full h-4 bg-secondary/30 rounded mb-2"></div>
                                  <div className="w-2/3 h-4 bg-secondary/30 rounded mb-4"></div>
                                  <div className="grid grid-cols-2 gap-1">
                                    <div className="h-10 bg-secondary/30 rounded"></div>
                                    <div className="h-10 bg-secondary/30 rounded"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Story Card Style</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 border border-highlight rounded-md bg-primary/20">
                                  <div className="w-full h-16 bg-secondary/30 rounded mb-2"></div>
                                  <div className="w-2/3 h-3 bg-secondary/30 rounded mb-1"></div>
                                  <div className="w-full h-3 bg-secondary/30 rounded"></div>
                                </div>
                                <div className="p-2 border border-secondary rounded-md bg-primary/20">
                                  <div className="w-1/3 h-3 bg-secondary/30 rounded mb-1"></div>
                                  <div className="w-full h-3 bg-secondary/30 rounded mb-1"></div>
                                  <div className="w-full h-16 bg-secondary/30 rounded"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button className="bg-highlight hover:bg-accent">
                        Save Appearance Settings
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Settings Tab */}
                  <TabsContent value="settings" className="mt-0">
                    <h2 className="text-3xl font-heading text-highlight mb-6">
                      Admin Settings
                    </h2>
                    
                    <p className="text-gray-300 mb-8">
                      Configure general site settings and admin preferences.
                    </p>
                    
                    <Card className="bg-primary/30 border-secondary mb-6">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-heading text-highlight mb-4">Story Submission Rules</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="autoApprove" 
                              className="mr-3 bg-primary/30 border-secondary"
                              checked={false}
                            />
                            <label htmlFor="autoApprove" className="text-gray-300">
                              Auto-approve submissions from verified authors
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="audioRequired" 
                              className="mr-3 bg-primary/30 border-secondary"
                              checked={false}
                            />
                            <label htmlFor="audioRequired" className="text-gray-300">
                              Require audio recordings for new submissions
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="contentFilter" 
                              className="mr-3 bg-primary/30 border-secondary"
                              checked={true}
                            />
                            <label htmlFor="contentFilter" className="text-gray-300">
                              Enable automatic content filtering
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-primary/30 border-secondary mb-6">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-heading text-highlight mb-4">User Registration</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="openRegistration" 
                              className="mr-3 bg-primary/30 border-secondary"
                              checked={true}
                            />
                            <label htmlFor="openRegistration" className="text-gray-300">
                              Allow open registration
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="emailVerification" 
                              className="mr-3 bg-primary/30 border-secondary"
                              checked={false}
                            />
                            <label htmlFor="emailVerification" className="text-gray-300">
                              Require email verification
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-6 flex justify-end">
                      <Button className="bg-highlight hover:bg-accent">
                        Save Settings
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the story and all associated comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStory}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteStoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Deleting...
                </>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
