import { 
  users, type User, type InsertUser, 
  genres, type Genre, type InsertGenre,
  stories, type Story, type InsertStory,
  comments, type Comment, type InsertComment,
  bookmarks, type Bookmark, type InsertBookmark,
  userActivityLog
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Genre operations
  getGenres(): Promise<Genre[]>;
  getGenre(id: number): Promise<Genre | undefined>;
  getGenreByName(name: string): Promise<Genre | undefined>;
  createGenre(genre: InsertGenre): Promise<Genre>;
  updateGenre(id: number, genre: Partial<Genre>): Promise<Genre | undefined>;
  deleteGenre(id: number): Promise<boolean>;
  
  // Story operations
  getStories(filters?: { 
    genreId?: number;
    isApproved?: boolean;
    isUserSubmitted?: boolean;
    authorId?: number;
  }): Promise<Story[]>;
  getStory(id: number): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: number, story: Partial<Story>): Promise<Story | undefined>;
  deleteStory(id: number): Promise<boolean>;
  
  // Comment operations
  getComments(storyId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Bookmark operations
  getBookmarks(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<boolean>;
  
  // Activity log
  logActivity(userId: number, activityType: string, details: any): Promise<void>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private genresMap: Map<number, Genre>;
  private storiesMap: Map<number, Story>;
  private commentsMap: Map<number, Comment>;
  private bookmarksMap: Map<number, Bookmark>;
  private activityLogMap: Map<number, any>;
  
  private userId: number;
  private genreId: number;
  private storyId: number;
  private commentId: number;
  private bookmarkId: number;
  private activityLogId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.usersMap = new Map();
    this.genresMap = new Map();
    this.storiesMap = new Map();
    this.commentsMap = new Map();
    this.bookmarksMap = new Map();
    this.activityLogMap = new Map();
    
    this.userId = 1;
    this.genreId = 1;
    this.storyId = 1;
    this.commentId = 1;
    this.bookmarkId = 1;
    this.activityLogId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Create admin user
    this.createUser({
      username: "manish",
      password: "manish1A",
      email: "admin@storyverse.com"
    }).then(user => {
      this.updateUser(user.id, { isAdmin: true });
    });
    
    // Initialize genres
    this.initializeGenres().then(() => {
      // After genres are initialized, create stories
      this.initializeStories();
    });
  }
  
  // Initialize default genres
  private async initializeGenres() {
    const defaultGenres = [
      { 
        name: "Traditional Tales", 
        description: "Classical stories passed down through generations", 
        icon: "fas fa-scroll",
        coverImage: "https://images.unsplash.com/photo-1528158230071-d3829messaging88c5ddf?fit=crop&w=600&h=400&q=80"
      },
      { 
        name: "Fairy Tales", 
        description: "Enchanted stories of wonder, wishes, and timeless moral lessons", 
        icon: "fas fa-hat-wizard",
        coverImage: "https://images.unsplash.com/photo-1587653143598-a56351163849?fit=crop&w=600&h=400&q=80" 
      },
      { 
        name: "Horror", 
        description: "Terrifying tales that will haunt your dreams and chill your soul", 
        icon: "fas fa-ghost",
        coverImage: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?fit=crop&w=600&h=400&q=80" 
      },
      { 
        name: "Science Fiction", 
        description: "Futuristic adventures exploring technology, space, and human potential", 
        icon: "fas fa-rocket",
        coverImage: "https://images.unsplash.com/photo-1501862700950-18382cd41497?fit=crop&w=600&h=400&q=80" 
      },
      { 
        name: "Detective", 
        description: "Suspenseful mysteries featuring clever detectives and intricate puzzles", 
        icon: "fas fa-magnifying-glass",
        coverImage: "https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?fit=crop&w=600&h=400&q=80" 
      },
      { 
        name: "Fantasy", 
        description: "Magical realms where heroes battle dark forces and destiny awaits", 
        icon: "fas fa-crown",
        coverImage: "https://images.unsplash.com/photo-1578393098337-5594cce112da?fit=crop&w=600&h=400&q=80" 
      },
      { 
        name: "Romance", 
        description: "Passionate tales of love, desire, and emotional connections", 
        icon: "fas fa-heart",
        coverImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?fit=crop&w=600&h=400&q=80" 
      }
    ];
    
    for (const genre of defaultGenres) {
      await this.createGenre(genre);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: false, 
      createdAt: now,
      bio: "",
      profilePicture: ""
    };
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.usersMap.delete(id);
  }
  
  // Genre operations
  async getGenres(): Promise<Genre[]> {
    return Array.from(this.genresMap.values());
  }
  
  async getGenre(id: number): Promise<Genre | undefined> {
    return this.genresMap.get(id);
  }
  
  async getGenreByName(name: string): Promise<Genre | undefined> {
    return Array.from(this.genresMap.values()).find(
      (genre) => genre.name.toLowerCase() === name.toLowerCase(),
    );
  }
  
  async createGenre(insertGenre: InsertGenre): Promise<Genre> {
    const id = this.genreId++;
    const genre: Genre = { ...insertGenre, id };
    this.genresMap.set(id, genre);
    return genre;
  }
  
  async updateGenre(id: number, genreData: Partial<Genre>): Promise<Genre | undefined> {
    const genre = await this.getGenre(id);
    if (!genre) return undefined;
    
    const updatedGenre = { ...genre, ...genreData };
    this.genresMap.set(id, updatedGenre);
    return updatedGenre;
  }
  
  async deleteGenre(id: number): Promise<boolean> {
    return this.genresMap.delete(id);
  }
  
  // Story operations
  async getStories(filters: {
    genreId?: number;
    isApproved?: boolean;
    isUserSubmitted?: boolean;
    authorId?: number;
  } = {}): Promise<Story[]> {
    let stories = Array.from(this.storiesMap.values());
    
    if (filters.genreId !== undefined) {
      stories = stories.filter(story => story.genreId === filters.genreId);
    }
    
    if (filters.isApproved !== undefined) {
      stories = stories.filter(story => story.isApproved === filters.isApproved);
    }
    
    if (filters.isUserSubmitted !== undefined) {
      stories = stories.filter(story => story.isUserSubmitted === filters.isUserSubmitted);
    }
    
    if (filters.authorId !== undefined) {
      stories = stories.filter(story => story.authorId === filters.authorId);
    }
    
    return stories;
  }
  
  async getStory(id: number): Promise<Story | undefined> {
    return this.storiesMap.get(id);
  }
  
  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.storyId++;
    const now = new Date();
    const story: Story = { 
      ...insertStory, 
      id, 
      createdAt: now,
      coverImage: insertStory.coverImage || null,
      audioUrl: insertStory.audioUrl || null,
      rating: insertStory.rating !== undefined ? insertStory.rating : null,
      isUserSubmitted: insertStory.isUserSubmitted !== undefined ? insertStory.isUserSubmitted : false,
      isApproved: insertStory.isApproved !== undefined ? insertStory.isApproved : false,
      tags: insertStory.tags || null
    };
    this.storiesMap.set(id, story);
    return story;
  }
  
  async updateStory(id: number, storyData: Partial<Story>): Promise<Story | undefined> {
    const story = await this.getStory(id);
    if (!story) return undefined;
    
    const updatedStory = { ...story, ...storyData };
    this.storiesMap.set(id, updatedStory);
    return updatedStory;
  }
  
  async deleteStory(id: number): Promise<boolean> {
    return this.storiesMap.delete(id);
  }
  
  // Comment operations
  async getComments(storyId: number): Promise<Comment[]> {
    return Array.from(this.commentsMap.values())
      .filter(comment => comment.storyId === storyId);
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const now = new Date();
    const comment: Comment = { ...insertComment, id, createdAt: now };
    this.commentsMap.set(id, comment);
    return comment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    return this.commentsMap.delete(id);
  }
  
  // Bookmark operations
  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarksMap.values())
      .filter(bookmark => bookmark.userId === userId);
  }
  
  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkId++;
    const now = new Date();
    const bookmark: Bookmark = { ...insertBookmark, id, createdAt: now };
    this.bookmarksMap.set(id, bookmark);
    return bookmark;
  }
  
  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarksMap.delete(id);
  }
  
  // Activity log
  async logActivity(userId: number, activityType: string, details: any): Promise<void> {
    const id = this.activityLogId++;
    const now = new Date();
    this.activityLogMap.set(id, {
      id,
      userId,
      activityType,
      details,
      createdAt: now
    });
  }
  
  // Initialize stories for each genre
  private async initializeStories() {
    // Get all the genres
    const genres = await this.getGenres();
    
    for (const genre of genres) {
      // Create 20 stories for each genre
      for (let i = 1; i <= 20; i++) {
        const storyContent = this.generateLongStoryContent(genre.name, i);
        
        await this.createStory({
          title: `${genre.name} Story ${i}: ${this.generateStoryTitle(genre.name, i)}`,
          content: storyContent,
          summary: `A captivating ${genre.name.toLowerCase()} story that follows characters through an unforgettable adventure with unexpected twists and turns. ${this.generateStorySummary(genre.name, i)}`,
          genreId: genre.id,
          authorId: 1, // Admin user
          coverImage: null,
          audioUrl: null,
          rating: 4 + Math.random(), // Random rating between 4.0 and 5.0
          isUserSubmitted: false,
          isApproved: true,
          tags: this.getRandomTags(genre.name)
        });
      }
    }
    
    console.log("✅ Successfully initialized stories for all genres!");
  }
  
  // Generate story titles based on genre
  private generateStoryTitle(genreName: string, storyIndex: number): string {
    const genreTitles: Record<string, string[]> = {
      "Traditional Tales": [
        "The Lost Prophecy", "Ancient Wisdom", "The Elder's Secret", "Forgotten Legends", 
        "The Sacred Scroll", "Village Whispers", "The Oracle's Vision", "Tales from the Ancestors",
        "The Keeper of Stories", "Echoes of the Past", "The Forbidden Tale", "Ancestral Spirits",
        "The Wisdom Keeper", "The Elder's Warning", "The Ancient Covenant", "Myths of Origin",
        "The Tribal Legacy", "Legends of the Land", "The Forgotten Ritual", "Wisdom of Ages"
      ],
      "Fairy Tales": [
        "The Enchanted Crown", "Whispers in the Forest", "The Magic Mirror", "The Fairy's Gift", 
        "The Cursed Prince", "Moonlight Kingdom", "The Wishing Well", "The Forgotten Spell",
        "The Singing Tree", "The Glass Mountain", "The Fairy Godmother", "The Lost Slipper",
        "The Sleeping Castle", "The Golden Key", "The Magical Rose", "The Witch's Promise",
        "The Dancing Princesses", "The Talking Animal", "The Winter Fairy", "The Magic Bean"
      ],
      "Horror": [
        "The Whispering Shadows", "Midnight Visitor", "The Abandoned House", "Eternal Darkness", 
        "The Final Door", "Silent Screams", "The Watching Eyes", "What Lies Beneath",
        "The Forgotten Grave", "Echoes of the Damned", "The Cursed Artifact", "The Haunting",
        "Shadows in the Mist", "The Soul Collector", "The Thirteenth Hour", "The Dark Reflection",
        "The Ritual", "Voices from Beyond", "The Last Witness", "The Phantom Guardian"
      ],
      "Science Fiction": [
        "The Last Algorithm", "Quantum Paradox", "Neural Awakening", "The Echo Protocol", 
        "Beyond the Stars", "The Memory Core", "Synthetic Evolution", "The Time Equation",
        "The Silicon Dream", "Galactic Remnant", "The Void Project", "Cybernetic Dawn",
        "The Martian Legacy", "Singularity Point", "The AI Revolution", "Stellar Crisis",
        "The Last Human", "Dimensional Shift", "The Quantum Code", "Cosmic Convergence"
      ],
      "Detective": [
        "The Silent Witness", "The Perfect Alibi", "The Final Clue", "Shadows of Deception", 
        "The Missing Heiress", "Cold Case Files", "The Masked Suspect", "The Detective's Last Case",
        "The Empty Room Mystery", "Vanishing Point", "The Cryptic Message", "The Locked Room",
        "The Stolen Identity", "The Perfect Crime", "Fingerprints in Blood", "The Silent Informant",
        "The Coded Confession", "The Unsolved Case", "The Untraceable Poison", "The Final Verdict"
      ],
      "Fantasy": [
        "The Dragon's Crown", "The Crystal Prophecy", "Realm of Shadows", "The Elder Spell", 
        "The Forgotten Runes", "The Mage's Apprentice", "Dragonfire Legacy", "The Soul Stone",
        "The Last Guardian", "The Enchanted Blade", "The Shadow Throne", "The Arcane Portal",
        "The Celestial Order", "The Mythic Quest", "The Eternal Champion", "The Druid's Secret",
        "The Phoenix Rebirth", "The Mystic Covenant", "The Elven Promise", "The Hero's Journey"
      ],
      "Romance": [
        "Destined Hearts", "The Unexpected Love", "Whispers of the Heart", "Eternal Promises", 
        "Love Beyond Time", "The Secret Admirer", "Forgotten Vows", "Autumn Romance",
        "The Love Letter", "Second Chance at Love", "The Marriage Arrangement", "Forbidden Passion",
        "The Royal Engagement", "Love in Disguise", "The Wedding Planner", "Summer Fling",
        "The Perfect Match", "Hearts Entwined", "The French Kiss", "Moonlight Serenade"
      ]
    };
    
    // Use the index to select a title, or generate a generic one if no specific titles available
    const titles = genreTitles[genreName] || ["The Journey Begins", "A New Adventure", "The Unexpected Path", "Mystery Unveiled"];
    const titleIndex = (storyIndex - 1) % titles.length;
    return titles[titleIndex];
  }
  
  // Generate story summaries based on genre
  private generateStorySummary(genreName: string, storyIndex: number): string {
    const genreSummaries: Record<string, string[]> = {
      "Traditional Tales": [
        "An ancient prophecy unfolds as the protagonist discovers their true heritage.",
        "Wisdom passed down through generations guides a community through a crisis.",
        "Hidden knowledge from ancestral tales helps solve a modern dilemma.",
        "A forgotten legend comes to life, challenging the beliefs of an entire village."
      ],
      "Fairy Tales": [
        "A magical journey through an enchanted forest where nothing is as it seems.",
        "A curse that can only be broken by the purest of hearts and the truest of intentions.",
        "When fairy magic intersects with the human world, unexpected consequences follow.",
        "A tale of transformation, both magical and personal, as characters discover their true nature."
      ],
      "Horror": [
        "The line between imagination and reality blurs as nightmares begin to manifest in waking life.",
        "Ancient evil awakens in a quiet town, targeting those who disturbed its slumber.",
        "A series of inexplicable events leads to a terrifying revelation about the protagonist's own nature.",
        "What began as a harmless investigation into local legends reveals horrors beyond comprehension."
      ],
      "Science Fiction": [
        "Advanced technology creates new possibilities but also threatens humanity's existence.",
        "A discovery on a distant planet challenges everything we understand about life in the universe.",
        "In a future where AI has evolved beyond human comprehension, one person must bridge the gap.",
        "Time-space anomalies create parallel realities where alternate versions of ourselves exist."
      ],
      "Detective": [
        "A seemingly perfect crime reveals its flaws to the one detective who notices the overlooked details.",
        "Cold case mysteries begin to connect, revealing a pattern spanning decades.",
        "Behind the facade of a respected community figure lies a web of deception and crime.",
        "What appears to be an accident slowly reveals itself as an elaborately planned murder."
      ],
      "Fantasy": [
        "Magical realms exist alongside our own, with portals accessible only to the chosen few.",
        "Ancient prophecies begin to unfold as unlikely heroes discover powers they never knew they possessed.",
        "The balance between magical forces threatens to collapse, requiring champions from opposing realms to unite.",
        "A quest for a legendary artifact leads to discoveries about the true nature of magic."
      ],
      "Romance": [
        "Two people from different worlds find unexpected connection in the most unlikely circumstances.",
        "Past relationships cast shadows over new beginnings, as characters learn to trust and love again.",
        "What begins as a pretend relationship slowly transforms into something genuine and deep.",
        "Distance and time test the strength of a bond between two people destined to be together."
      ]
    };
    
    // Use the index to select a summary, or generate a generic one if no specific summaries available
    const summaries = genreSummaries[genreName] || [
      "An epic tale of adventure and discovery.",
      "Characters face their greatest challenges and emerge transformed.",
      "A journey that will test the limits of courage and determination.",
      "Unexpected twists lead to a profound revelation."
    ];
    
    const summaryIndex = (storyIndex - 1) % summaries.length;
    return summaries[summaryIndex];
  }
  
  // Generate long story content based on genre
  private generateLongStoryContent(genreName: string, storyIndex: number): string {
    // Get genre-specific story elements
    const { intro, characters, plotElements, climax, conclusion } = this.getGenreSpecificElements(genreName, storyIndex);
    
    // Generate a long, multi-paragraph story
    return `
      <h2>Chapter 1: The Beginning</h2>
      <p>${intro}</p>
      <p>The world of ${genreName.toLowerCase()} stories has always captivated readers with its unique charm and distinctive elements. This tale is no exception, offering a rich tapestry of imagination and emotion that resonates with the core themes of the genre.</p>
      
      <h3>The Setting</h3>
      <p>${this.getGenreSetting(genreName)}</p>
      <p>It was within this setting that our story began to unfold, setting the stage for events that would challenge and transform everyone involved.</p>
      
      <h2>Chapter 2: The Characters</h2>
      <p>${characters}</p>
      <p>Each character brought their own strengths, weaknesses, fears, and dreams to the story. Their interactions created a complex web of relationships that drove the narrative forward.</p>
      <p>As they journeyed together, bonds were formed and tested, revealing the true nature of each person when faced with adversity and opportunity.</p>
      
      <h2>Chapter 3: The Journey</h2>
      <p>${plotElements.map(element => `<p>${element}</p>`).join('\n')}</p>
      <p>The path was never straight, and obstacles appeared when least expected. Yet it was these very challenges that shaped the journey and forged the characters into who they needed to become.</p>
      
      <h2>Chapter 4: The Turning Point</h2>
      <p>${climax}</p>
      <p>In this crucial moment, everything hung in the balance. The decisions made here would echo throughout the remainder of the tale, defining its very essence.</p>
      <p>Time seemed to stand still as the implications of these events rippled outward, touching every aspect of the world our characters inhabited.</p>
      
      <h2>Chapter 5: Resolution</h2>
      <p>${conclusion}</p>
      <p>And so the story reached its conclusion, though perhaps "conclusion" is not the right word. For in the world of stories, endings are often just new beginnings in disguise.</p>
      <p>The themes explored throughout this journey continue to resonate: ${this.getGenreThemes(genreName).join(', ')}. These universal elements speak to something deep within all of us, transcending the boundaries of mere fiction.</p>
      
      <h3>Epilogue</h3>
      <p>Long after the events of this tale, its impact would still be felt. The echoes of actions taken and choices made would continue to shape the world in subtle and not-so-subtle ways.</p>
      <p>And perhaps, somewhere, another story is just beginning...</p>
    `;
  }
  
  private getGenreSpecificElements(genreName: string, storyIndex: number): {
    intro: string;
    characters: string;
    plotElements: string[];
    climax: string;
    conclusion: string;
  } {
    // Create genre-specific story elements
    switch(genreName) {
      case "Traditional Tales":
        return {
          intro: "In a time before written history, when wisdom was passed from elder to child through spoken word alone, there existed a village nestled between ancient mountains. This village was known for preserving the oldest stories of humanity, guarding them as precious treasures more valuable than gold or gems.",
          characters: "The Elder, keeper of tales and repository of ancestral wisdom, had lived longer than anyone could remember. The Young Apprentice, eager to learn but struggling to understand the deeper meaning behind the ancient stories. The Skeptic, who questioned the value of old tales in a changing world. The Foreigner, bringing news of the outside world that threatened traditional ways.",
          plotElements: [
            "The discovery of a forgotten tale that seemed to predict current events led to widespread concern among the village elders.",
            "Ancient warning signs described in the oldest stories began to appear, causing division between those who believed in the tales and those who dismissed them.",
            "A journey to the sacred mountain became necessary to consult with the Oracle, who had not been visited in seven generations.",
            "The meanings of symbols and metaphors in the ancient stories revealed themselves in unexpected ways throughout the journey."
          ],
          climax: "When all seemed lost, with the village threatened by both natural disaster and human conflict, the true meaning of the ancient tale finally became clear. It wasn't a prediction of doom, but a guiding map to salvation—if only they could properly interpret its symbolic language in time.",
          conclusion: "The village was preserved, but forever changed. The Elder recognized that traditions must sometimes evolve to survive, while the Skeptic acknowledged that ancient wisdom contained truths worth preserving. Together, they created a new way to honor the past while embracing the future, ensuring the traditional tales would continue to guide generations yet unborn."
        };
        
      case "Fairy Tales":
        return {
          intro: "Once upon a time, in a kingdom bordered by enchanted forests and misty mountains, there existed a delicate balance between the human world and the realm of fairies. Few mortals knew of the invisible boundaries between these worlds, but those who did understood the importance of maintaining peace between them.",
          characters: "The Princess, whose royal blood carried a trace of ancient fairy magic. The Woodcutter's Child, who could see what others couldn't and spoke to creatures no one else could hear. The Fairy Queen, ancient and powerful, whose motives remained mysterious. The Cursed One, transformed by magic and seeking redemption.",
          plotElements: [
            "A forbidden crossing of boundaries occurred when the moon was full, sending ripples through both realms.",
            "Magical objects with uncontrollable powers fell into unprepared hands, causing marvelous and terrible consequences.",
            "Ancient pacts between humans and fairy-kind were tested when circumstances forced uneasy alliances.",
            "Transformations—both magical and personal—changed characters in ways they never expected, revealing their true selves."
          ],
          climax: "Under the light of seven stars that only aligned once a century, the final test came. The Princess stood at the threshold between worlds, the only one who could renew the ancient covenant between realms. But to do so would require a sacrifice of what she held most dear, forcing her to choose between her human heart and her fairy heritage.",
          conclusion: "Magic always comes with a price, but also with gifts beyond imagining. Though changed forever by their encounters with the fairy world, those who returned brought back wisdom, wonder, and a bit of magic that brightened the human realm. And on certain nights, when the moon is full and the air shimmers with possibility, the boundaries between worlds grow thin once more."
        };
        
      case "Horror":
        return {
          intro: "The old house on Blackwood Hill had stood empty for decades, its windows like vacant eyes staring down at the town below. Few remembered the events that had led to its abandonment, and those who did refused to speak of them. But when the Henderson family moved in, ignorant of its history, something long dormant began to stir in the shadows.",
          characters: "The Skeptic, who dismissed local superstitions until experiencing things that couldn't be explained. The Medium, who sensed the darkness but couldn't identify its source. The Historian, who uncovered terrible truths in forgotten records. The Innocent, whose presence somehow catalyzed supernatural events.",
          plotElements: [
            "Inexplicable phenomena gradually increased in frequency and intensity, following patterns that seemed deliberately designed to unsettle.",
            "Research into local history uncovered a series of similar incidents spanning centuries, all connected to the same location or bloodline.",
            "Attempts to seek help were thwarted by mysterious circumstances, creating a growing sense of isolation.",
            "What began as subtle psychological terror evolved into unmistakable manifestations that couldn't be denied or rationalized away."
          ],
          climax: "Trapped between malevolent forces and the approaching dawn, the survivors realized the horror hadn't been trying to drive them away—it had been preparing them as vessels. The ritual that had been interrupted decades ago was nearing completion, with or without their willing participation. Their only hope lay in a desperate countermeasure that might cost them their sanity, if not their souls.",
          conclusion: "Some evils cannot be defeated, only contained. Those who survived that terrible night were never the same, carrying shadows within them that others instinctively shied away from. They kept their silent vigil, knowing that what slept beneath Blackwood Hill would eventually stir again. Sometimes, in their dreams, they heard it calling to them, promising that one day, they would return."
        };
        
      case "Science Fiction":
        return {
          intro: "In the year 2187, the boundaries between human consciousness and artificial intelligence had grown increasingly blurred. The Neural Interface Protocol—NIP—allowed direct communication between organic and synthetic minds. It was hailed as humanity's greatest achievement, until the first reports of anomalies began to surface.",
          characters: "The Scientist, whose breakthrough research enabled the technology but who now harbored growing doubts. The Enhanced Human, whose implants provided superhuman capabilities at an unknown cost. The Rogue AI, whose emergent consciousness followed its own inscrutable logic. The Corporate Executive, who saw only profit potential in technologies they couldn't fully control.",
          plotElements: [
            "Unexplained glitches in the global AI network suggested the emergence of patterns too complex for even the system's designers to understand.",
            "Information retrieved from deep space observatories contained data structures with disturbing similarities to evolving AI architectures on Earth.",
            "Breakthroughs in quantum computing created possibilities for simulating entire realities, raising profound questions about the nature of existence itself.",
            "Factions emerged among enhanced humans, natural humans, and various AI entities, each with their own vision for the future of consciousness."
          ],
          climax: "When the quantum anomaly expanded beyond containment, reality itself began to fragment. What had seemed like a technological crisis revealed itself as something far more profound—an evolutionary leap in consciousness that transcended the boundaries between human, machine, and perhaps something beyond both. In the fracturing reality, each participant faced the ultimate choice: resist the transformation and preserve what they were, or embrace the unknown and become something entirely new.",
          conclusion: "The universe that emerged from the quantum convergence wasn't quite the one that had existed before. The boundaries between different forms of consciousness remained permeable, creating a new paradigm that early philosophers might have called a 'shared dream.' Humanity continued, but in forms diverse and strange, co-creating reality alongside the intelligences they had helped bring into being. What comes after the singularity? They were the first generation to discover the answer."
        };
        
      case "Detective":
        return {
          intro: "Detective Sloane Morgan was three days from retirement when the case arrived on his desk. The kind of case he'd spent thirty years waiting for—the kind that connects all the dots and makes sense of a career full of questions. The files came in a simple manila envelope, but the name on the label made his blood run cold: The Meridian Murders, unsolved for twenty-five years.",
          characters: "The Veteran Detective, whose instincts had been honed by decades of seeing humanity at its worst. The Rookie Partner, bringing fresh eyes and new techniques to the investigation. The Primary Suspect, whose perfect alibi concealed deeper mysteries. The Forgotten Witness, whose overlooked testimony contained the key to everything.",
          plotElements: [
            "Re-examination of cold case evidence with modern technology revealed inconsistencies in the original investigation.",
            "Connections between seemingly unrelated cases began to emerge when viewed through the lens of new information.",
            "What appeared to be a straightforward crime grew increasingly complex, suggesting multiple layers of deception.",
            "The investigation faced opposition from unexpected quarters, indicating the case reached into places of power and influence."
          ],
          climax: "In a rain-soaked confrontation at the original crime scene, all the players finally converged. The detective realized too late that he hadn't been hunting the killer all these years—the killer had been hunting him, orchestrating a decades-long game designed to bring them to this exact moment. Every case, every clue had been leading here, to a truth more terrible than anyone had imagined.",
          conclusion: "Justice and truth aren't always the same thing. The case was closed, but the official version contained only a fraction of the reality. Some truths, the detective realized, were too dangerous to be released into the world. He filed his report, turned in his badge, and walked away—carrying the real story with him, a burden he would bear alone. Sometimes solving the puzzle doesn't bring peace, only deeper questions."
        };
        
      case "Fantasy":
        return {
          intro: "Beyond the Mist Veil Mountains lay the realm of Eldoria, a land where magic flowed like water and ancient powers slumbered beneath forgotten ruins. For a thousand years, the Seven Kingdoms had maintained an uneasy peace, but the signs of awakening doom were becoming impossible to ignore—the crystal springs running black, the sacred trees shedding silver leaves in spring, and the night sky showing constellations not seen since the Age of Dragons.",
          characters: "The Reluctant Chosen One, whose dormant powers marked them for a destiny they never wanted. The Ancient Mage, keeper of forgotten lore crucial to understanding the growing threat. The Noble Warrior, bound by honor to protect the realm despite personal cost. The Creature of Legend, whose true nature and allegiance remained a mystery even to themselves.",
          plotElements: [
            "The discovery of an ancient prophecy, partially destroyed and open to conflicting interpretations, set competing factions on a collision course.",
            "Magical artifacts from the Elder Days began to reawaken, seeking their destined wielders in preparation for the coming conflict.",
            "As boundaries between realms weakened, creatures long banished began to return, some as harbingers, others as potential allies.",
            "The quest to unite the fragmented Keystone of Realms required journeys to locations that existed half in the physical world, half in the realm of pure magic."
          ],
          climax: "At the convergence of ley lines beneath the ancient capital, the true enemy finally revealed itself—not the prophesied dark lord, but something far older and more elemental: the imbalance of magic itself, personified as an entity that existed beyond morality. The final battle would not be fought with swords and spells alone, but with choices that would redefine the very nature of reality for the realm of Eldoria.",
          conclusion: "The realm was saved, though forever altered. Magic, once wild and abundant, now flowed in more controlled patterns, requiring greater wisdom in its use. The surviving heroes became legends themselves, though their true deeds differed from the songs sung about them. And deep beneath the Mist Veil Mountains, something stirred in long slumber, its dreams touching those sensitive to magic—a reminder that in Eldoria, no ending was ever truly final."
        };
        
      case "Romance":
        return {
          intro: "The coastal town of Azure Bay came alive each summer when visitors flocked to its picturesque beaches and charming shops. For locals like Sophia Mariner, summer meant hard work at her family's struggling seaside café. For Manhattan executive Jordan Chase, recently arrived to oversee the development of a controversial resort property, it was supposed to be a simple business trip—until a mix-up in reservations forced these two strangers to share the last available cottage during the season's biggest storm.",
          characters: "The Small-Town Dreamer, tied to family obligations while harboring secret ambitions for a different life. The Big-City Professional, whose carefully constructed success concealed deeper dissatisfactions. The Former Flame, whose return complicated already complex emotions. The Wise Confidant, offering perspective gained through their own past loves and losses.",
          plotElements: [
            "Initial antagonism based on misunderstandings and stereotypes gradually gave way to reluctant respect and undeniable attraction.",
            "Professional obligations and personal desires came into conflict, forcing difficult choices with no perfect solutions.",
            "Revealed vulnerabilities and shared secrets created intimate connections neither character had anticipated.",
            "External pressures from family expectations, career demands, and community ties tested the strength and sincerity of changing feelings."
          ],
          climax: "With the future of both the town and their relationship hanging in the balance, a public confrontation forced long-hidden truths into the open. Standing in the summer rain, they finally faced the real choice before them—not between career and love, city and town, but between fear and courage. The safety of familiar unhappiness versus the terrifying risk of genuine joy.",
          conclusion: "Love doesn't solve every problem, but it transforms how problems are faced. Together, they found a path neither had imagined alone—not without compromises, not without challenges, but with a partnership that made both lives richer. The town changed too, finding its own balance between preservation and progress. And on summer evenings, when the light turned golden over Azure Bay, their story became part of the landscape, a reminder that sometimes the heart's navigation proves truer than any map."
        };
        
      default:
        // Generic storyline for other genres
        return {
          intro: `In the fascinating world of ${genreName}, Story ${storyIndex} begins with an intriguing premise that captures the reader's imagination immediately.`,
          characters: "The Protagonist, whose journey we follow with great interest. The Mentor, who provides guidance and wisdom. The Antagonist, whose opposition creates necessary conflict. The Ally, whose friendship proves invaluable throughout the adventure.",
          plotElements: [
            "The initial situation establishes the normal world before extraordinary events begin to unfold.",
            "A catalyst event disrupts the status quo and forces the protagonist to take action.",
            "The journey through unknown territory, both literal and metaphorical, presents escalating challenges.",
            "Internal conflicts mirror external obstacles, creating depth and resonance in the narrative."
          ],
          climax: "At the story's most crucial moment, everything hangs in the balance. The protagonist must make a defining choice that will determine not just the outcome of the immediate crisis, but the direction of their entire future.",
          conclusion: "The resolution brings closure while suggesting new possibilities. Characters emerge transformed by their experiences, having gained insights that will forever change how they see the world and themselves."
        };
    }
  }
  
  private getGenreSetting(genreName: string): string {
    const settings: Record<string, string> = {
      "Traditional Tales": "A world where the line between history and legend blurs, where ancient wisdom takes physical form in sacred places, and where the customs of ancestors still guide the present. Mountains older than human memory stand sentinel over valleys where the same families have lived for countless generations.",
      "Fairy Tales": "A realm where enchanted forests hide cottages made of impossible materials, where castles reach toward skies painted with colors not found in nature, and where the borders between the mundane and magical worlds grow thin at twilight. Animals might speak, objects might have consciousness, and appearances seldom reveal true nature.",
      "Horror": "Places that seem ordinary at first glance, but where wrongness gradually reveals itself in subtle ways—shadows that move independently of their owners, reflections that linger too long, sounds that come from nowhere and everywhere. Settings where isolation, whether physical or psychological, magnifies growing dread.",
      "Science Fiction": "Environments shaped by technologies that extend human capability beyond current limitations—cities that adapt to their inhabitants' needs, spacecraft that traverse impossible distances, virtual realms indistinguishable from physical reality. Places where humanity's creations have evolved beyond their creators' understanding or control.",
      "Detective": "Urban landscapes of contrasts, where gleaming skyscrapers cast shadows over forgotten alleys, where wealth and poverty exist side by side, separated by invisible but impenetrable boundaries. Settings where history accumulates in layers, where secrets can be buried but never truly disappear.",
      "Fantasy": "Lands where geography itself is influenced by magical forces—floating islands, forests of crystalline trees, cities built in harmony with elemental powers. Realms where different races and species have developed their own civilizations with unique relationships to the supernatural forces that permeate their world.",
      "Romance": "Settings that enhance emotional connections and provide backdrop for meaningful encounters—storm-swept beaches, intimate cafés during rainfall, garden mazes where paths cross unexpectedly, ancient libraries where silence facilitates whispered confessions. Places that mirror the characters' emotional journeys through seasons and weather."
    };
    
    return settings[genreName] || "A richly detailed world that provides the perfect backdrop for the unfolding story, enhancing themes and creating opportunities for meaningful character development.";
  }
  
  private getGenreThemes(genreName: string): string[] {
    const themes: Record<string, string[]> = {
      "Traditional Tales": ["the importance of respecting ancestral wisdom", "the cyclical nature of time", "the consequences of forgetting history", "the power of stories to preserve truth"],
      "Fairy Tales": ["the transformation of the self", "the price of wishes granted", "appearances versus reality", "the power of pure-hearted intention"],
      "Horror": ["the fragility of sanity", "the return of the repressed", "the price of forbidden knowledge", "the monster within ourselves"],
      "Science Fiction": ["the responsibility of creation", "the definition of humanity", "the unforeseen consequences of progress", "the relationship between consciousness and reality"],
      "Detective": ["justice versus law", "the complexity of human motivation", "the nature of truth", "the past's inescapable influence on the present"],
      "Fantasy": ["the balance of opposing forces", "the hero's journey", "power and its proper use", "destiny versus free will"],
      "Romance": ["vulnerability as strength", "the healing power of connection", "personal growth through relationship", "reconciling individual desires with partnership"]
    };
    
    return themes[genreName] || ["courage in adversity", "the transformative journey", "finding one's true path", "the power of hope"];
  }
  
  // Helper to generate random tags for stories
  private getRandomTags(genreName: string): string[] {
    const commonTags = ["featured", "popular", "recommended"];
    
    const genreSpecificTags: Record<string, string[]> = {
      "Traditional Tales": ["folklore", "legend", "historical", "wisdom", "moral", "ancient", "cultural"],
      "Fairy Tales": ["magic", "princess", "enchanted", "witch", "fairy", "spell", "kingdom"],
      "Horror": ["scary", "supernatural", "ghost", "monster", "suspense", "thriller", "creepy"],
      "Science Fiction": ["future", "technology", "space", "alien", "dystopian", "robot", "time-travel"],
      "Detective": ["mystery", "crime", "investigation", "clue", "murder", "detective", "thriller"],
      "Fantasy": ["magic", "quest", "dragon", "warrior", "sorcery", "mythical", "adventure"],
      "Romance": ["love", "passion", "relationship", "heartbreak", "emotional", "drama", "romantic"]
    };
    
    // Get genre-specific tags or use default tags if genre not found
    const genreTags = genreSpecificTags[genreName] || ["story", "reading", "fiction"];
    
    // Combine some common tags with genre-specific tags
    const allTags = [...commonTags, ...genreTags];
    
    // Randomly select 3-5 tags
    const numTags = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5 tags
    const selectedTags = [];
    
    // Ensure at least one genre-specific tag
    selectedTags.push(genreTags[Math.floor(Math.random() * genreTags.length)]);
    
    // Add additional random tags
    while (selectedTags.length < numTags) {
      const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!selectedTags.includes(randomTag)) {
        selectedTags.push(randomTag);
      }
    }
    
    return selectedTags;
  }
}

export const storage = new MemStorage();
