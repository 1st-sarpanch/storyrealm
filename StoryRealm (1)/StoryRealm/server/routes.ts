import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertStorySchema, insertCommentSchema, insertBookmarkSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get all genres
  app.get("/api/genres", async (req, res) => {
    try {
      const genres = await storage.getGenres();
      res.json(genres);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch genres" });
    }
  });

  // Get a specific genre by ID
  app.get("/api/genres/:id", async (req, res) => {
    try {
      const genre = await storage.getGenre(parseInt(req.params.id));
      if (!genre) {
        return res.status(404).json({ error: "Genre not found" });
      }
      res.json(genre);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch genre" });
    }
  });

  // Get stories by genre
  app.get("/api/genres/:id/stories", async (req, res) => {
    try {
      const genreId = parseInt(req.params.id);
      const genre = await storage.getGenre(genreId);
      if (!genre) {
        return res.status(404).json({ error: "Genre not found" });
      }

      const stories = await storage.getStories({ 
        genreId,
        isApproved: true
      });
      res.json(stories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });

  // Get real stories (user submitted with audio recordings)
  app.get("/api/stories/real", async (req, res) => {
    try {
      const stories = await storage.getStories({
        isUserSubmitted: true,
        isApproved: true
      });
      
      // Filter to only include stories with audio
      const realStories = stories.filter(story => story.audioUrl);
      
      res.json(realStories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch real stories" });
    }
  });
  
  // Get all stories (with optional filtering)
  app.get("/api/stories", async (req, res) => {
    try {
      const filters: any = { isApproved: true };
      
      if (req.query.genreId) {
        filters.genreId = parseInt(req.query.genreId as string);
      }
      
      if (req.query.isUserSubmitted !== undefined) {
        filters.isUserSubmitted = req.query.isUserSubmitted === 'true';
      }
      
      const stories = await storage.getStories(filters);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });

  // Get a specific story
  app.get("/api/stories/:id", async (req, res) => {
    try {
      const story = await storage.getStory(parseInt(req.params.id));
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch story" });
    }
  });

  // Create a new story (authenticated)
  app.post("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Process tags if they exist (coming as JSON string from FormData)
      let tags = undefined;
      if (req.body.tags) {
        try {
          tags = JSON.parse(req.body.tags);
        } catch (e) {
          console.log('Error parsing tags:', e);
        }
      }
      
      const validatedData = insertStorySchema.parse({
        ...req.body,
        authorId: req.user.id,
        isUserSubmitted: true,
        isApproved: req.user.isAdmin, // Auto-approve if admin
        tags: tags // Add tags to the validated data
      });
      
      const story = await storage.createStory(validatedData);
      
      // Log activity
      await storage.logActivity(
        req.user.id,
        "create_story",
        { storyId: story.id, title: story.title }
      );
      
      res.status(201).json(story);
    } catch (error) {
      console.log('Story creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create story" });
    }
  });

  // Update a story (admin or author only)
  app.put("/api/stories/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const storyId = parseInt(req.params.id);
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      // Check if user is admin or author
      if (!req.user.isAdmin && story.authorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Process tags if they exist (coming as JSON string from FormData)
      let updatedData = { ...req.body };
      if (req.body.tags && typeof req.body.tags === 'string') {
        try {
          updatedData.tags = JSON.parse(req.body.tags);
        } catch (e) {
          console.log('Error parsing tags during update:', e);
        }
      }
      
      const updatedStory = await storage.updateStory(storyId, updatedData);
      
      // Log activity
      await storage.logActivity(
        req.user.id,
        "update_story",
        { storyId, title: story.title }
      );
      
      res.json(updatedStory);
    } catch (error) {
      console.log('Story update error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update story" });
    }
  });

  // Delete a story (admin or author only)
  app.delete("/api/stories/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const storyId = parseInt(req.params.id);
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      // Check if user is admin or author
      if (!req.user.isAdmin && story.authorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await storage.deleteStory(storyId);
      
      // Log activity
      await storage.logActivity(
        req.user.id,
        "delete_story",
        { storyId, title: story.title }
      );
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete story" });
    }
  });

  // Get comments for a story
  app.get("/api/stories/:id/comments", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      const comments = await storage.getComments(storyId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Add a comment to a story (authenticated)
  app.post("/api/stories/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const storyId = parseInt(req.params.id);
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        authorId: req.user.id,
        storyId
      });
      
      const comment = await storage.createComment(validatedData);
      
      // Log activity
      await storage.logActivity(
        req.user.id,
        "create_comment",
        { storyId, commentId: comment.id }
      );
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // User bookmarks
  app.get("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const bookmarks = await storage.getBookmarks(req.user.id);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  // Add bookmark (authenticated)
  app.post("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const validatedData = insertBookmarkSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const bookmark = await storage.createBookmark(validatedData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create bookmark" });
    }
  });

  // Delete bookmark (authenticated)
  app.delete("/api/bookmarks/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const bookmarkId = parseInt(req.params.id);
      await storage.deleteBookmark(bookmarkId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bookmark" });
    }
  });

  // Get all users (for mentions, user profiles, etc)
  app.get("/api/users", async (req, res) => {
    try {
      // This is a public list of users with limited info
      const users = [
        { id: 1, username: 'manish', isAdmin: true },
        { id: 2, username: 'user123', isAdmin: false },
        { id: 3, username: 'storyteller', isAdmin: false }
      ];
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin routes
  // Get all users (admin only - with more details)
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      // This is just a mock implementation for now
      const users = [
        { id: 1, username: 'manish', isAdmin: true },
        { id: 2, username: 'user123', isAdmin: false },
        { id: 3, username: 'storyteller', isAdmin: false }
      ];
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get pending stories (admin only)
  app.get("/api/admin/pending-stories", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const pendingStories = await storage.getStories({ isApproved: false });
      res.json(pendingStories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending stories" });
    }
  });

  // Approve/reject story (admin only)
  app.patch("/api/admin/stories/:id/approval", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const storyId = parseInt(req.params.id);
      const { isApproved } = req.body;
      
      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({ error: "isApproved must be a boolean" });
      }
      
      const story = await storage.getStory(storyId);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      const updatedStory = await storage.updateStory(storyId, { isApproved });
      
      // Log activity
      await storage.logActivity(
        req.user.id,
        isApproved ? "approve_story" : "reject_story",
        { storyId, title: story.title }
      );
      
      res.json(updatedStory);
    } catch (error) {
      res.status(500).json({ error: "Failed to update story approval status" });
    }
  });

  // Create a new genre (admin only)
  app.post("/api/admin/genres", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const genre = await storage.createGenre(req.body);
      res.status(201).json(genre);
    } catch (error) {
      res.status(500).json({ error: "Failed to create genre" });
    }
  });

  // Update a genre (admin only)
  app.put("/api/admin/genres/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const genreId = parseInt(req.params.id);
      const genre = await storage.getGenre(genreId);
      
      if (!genre) {
        return res.status(404).json({ error: "Genre not found" });
      }
      
      const updatedGenre = await storage.updateGenre(genreId, req.body);
      res.json(updatedGenre);
    } catch (error) {
      res.status(500).json({ error: "Failed to update genre" });
    }
  });

  // Delete a genre (admin only)
  app.delete("/api/admin/genres/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const genreId = parseInt(req.params.id);
      const genre = await storage.getGenre(genreId);
      
      if (!genre) {
        return res.status(404).json({ error: "Genre not found" });
      }
      
      await storage.deleteGenre(genreId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete genre" });
    }
  });

  // Save audio for a story (authenticated)
  app.post("/api/stories/:id/audio", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const storyId = parseInt(req.params.id);
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      // Check if user is admin or author
      if (!req.user.isAdmin && story.authorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { audioUrl } = req.body;
      
      if (!audioUrl) {
        return res.status(400).json({ error: "audioUrl is required" });
      }
      
      const updatedStory = await storage.updateStory(storyId, { audioUrl });
      
      // Log activity
      await storage.logActivity(
        req.user.id,
        "add_audio",
        { storyId, title: story.title }
      );
      
      res.json(updatedStory);
    } catch (error) {
      res.status(500).json({ error: "Failed to save audio" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
