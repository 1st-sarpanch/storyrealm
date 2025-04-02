import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  icon: text("icon"),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  coverImage: text("cover_image"),
  genreId: integer("genre_id").notNull(),
  authorId: integer("author_id").notNull(),
  audioUrl: text("audio_url"),
  rating: integer("rating"),
  isUserSubmitted: boolean("is_user_submitted").default(false).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  tags: text("tags").array(), // Store tags as an array of strings
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  storyId: integer("story_id").notNull(),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  storyId: integer("story_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userActivityLog = pgTable("user_activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertGenreSchema = createInsertSchema(genres).pick({
  name: true,
  description: true,
  coverImage: true,
  icon: true,
});

export const insertStorySchema = createInsertSchema(stories).pick({
  title: true,
  content: true,
  summary: true,
  coverImage: true,
  genreId: true,
  authorId: true,
  audioUrl: true,
  rating: true,
  isUserSubmitted: true,
  isApproved: true,
  tags: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  storyId: true,
  authorId: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).pick({
  userId: true,
  storyId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type Genre = typeof genres.$inferSelect;

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
