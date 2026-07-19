export type ContentKind = "project" | "writing" | "reading" | "interest";
export type ProjectStatus = "Idea" | "Active" | "Paused" | "Completed";
export type WritingKind = "Essay" | "Note" | "Mental Model" | "Book Note" | "Article Response" | "Interview Reflection";

export type Relationship = {
  kind: ContentKind;
  slug: string;
};

export type Project = {
  kind: "project";
  slug: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  completedAt?: string;
  tags: string[];
  links: { label: string; href: string }[];
  featuredImage: string;
  problem: string;
  solution: string;
  architecture: string[];
  lessons: string[];
  roadmap: string[];
  related: Relationship[];
};

export type Writing = {
  kind: "writing";
  slug: string;
  type: WritingKind;
  title: string;
  subtitle: string;
  publishDate: string;
  tags: string[];
  readingTime: string;
  body: string;
  related: Relationship[];
};

export type Reading = {
  kind: "reading";
  slug: string;
  title: string;
  author: string;
  sourceUrl: string;
  dateRead: string;
  category: string;
  summary: string;
  progressCurrent?: number;
  progressTotal?: number;
  progressUnit?: "pages" | "minutes" | "percent";
  completedAt?: string;
  keyTakeaways: string[];
  thoughts: string;
  rating?: number;
  tags: string[];
  related: Relationship[];
};

export type Interest = {
  kind: "interest";
  slug: string;
  title: string;
  overview: string;
  keyQuestions: string[];
  favoriteBooks: string[];
  favoriteArticles: { title: string; href: string }[];
  favoriteThinkers: string[];
  currentThoughts: string;
  tags: string[];
  related: Relationship[];
};

export const projects: Project[] = [
  {
    kind: "project",
    slug: "capture-layer",
    title: "PKM Capture Layer",
    description: "A lightweight system for saving notes, sources, and half-formed ideas before they vanish.",
    status: "Active",
    startDate: "2026-01",
    tags: ["PKM", "Tools", "Knowledge Work"],
    links: [{ label: "GitHub", href: "https://github.com/" }],
    featuredImage: "/project-capture.svg",
    problem: "Interesting ideas arrive in browsers, books, conversations, and feeds, but most capture tools turn collection into a chore.",
    solution: "A fast inbox with metadata, tags, and relationship prompts that can graduate fragments into durable notes or public essays.",
    architecture: ["Next.js interface", "Supabase tables for captures and relationships", "Postgres full text search", "Storage-backed media"],
    lessons: ["Capture must be fast enough to use while distracted.", "Relationships are easier to add at review time than at collection time."],
    roadmap: ["Browser extension", "Readwise import", "Embeddable backlink graph"],
    related: [
      { kind: "interest", slug: "technology" },
      { kind: "writing", slug: "notes-as-working-memory" }
    ]
  },
  {
    kind: "project",
    slug: "reader-app",
    title: "Reader App",
    description: "A personal reading workflow for turning articles into notes, takeaways, and topic maps.",
    status: "Active",
    startDate: "2025-10",
    tags: ["Reading", "AI", "Interfaces"],
    links: [{ label: "Demo", href: "#" }],
    featuredImage: "/project-reader.svg",
    problem: "Reading apps often optimize saving, not remembering or connecting.",
    solution: "A reading log that extracts source metadata, encourages short reflections, and links notes to longer-running questions.",
    architecture: ["URL extraction route", "Structured reading entries", "Topic and tag relationships", "Future LLM-assisted summaries"],
    lessons: ["The best workflow is mostly subtraction.", "A useful summary should preserve your reason for caring."],
    roadmap: ["Newsletter ingestion", "Citation export", "Public shelves"],
    related: [
      { kind: "reading", slug: "why-information-grows" },
      { kind: "interest", slug: "economics" }
    ]
  }
];

export const writing: Writing[] = [
  {
    kind: "writing",
    slug: "notes-as-working-memory",
    type: "Essay",
    title: "Notes as Working Memory",
    subtitle: "A practical theory of capture, compression, and return.",
    publishDate: "2026-06-01",
    tags: ["PKM", "Learning", "Tools"],
    readingTime: "8 min",
    body: "The point of a note is not storage. The point is to make an idea available to the future version of you who has better context. That means notes should be written for return, not just for capture.",
    related: [
      { kind: "project", slug: "capture-layer" },
      { kind: "interest", slug: "technology" }
    ]
  },
  {
    kind: "writing",
    slug: "markets-and-memory",
    type: "Mental Model",
    title: "Markets and Memory",
    subtitle: "Why institutions are sometimes better thought of as compression systems.",
    publishDate: "2026-05-12",
    tags: ["Economics", "History", "Systems"],
    readingTime: "6 min",
    body: "Prices, norms, and routines compress a surprising amount of social information. The compression is lossy, but often more useful than pretending a single mind can inspect the whole system.",
    related: [
      { kind: "reading", slug: "why-information-grows" },
      { kind: "interest", slug: "economics" }
    ]
  },
  {
    kind: "writing",
    slug: "interviews-as-compression",
    type: "Interview Reflection",
    title: "Interviews as Compression",
    subtitle: "What technical interviews reveal, hide, and distort.",
    publishDate: "2026-04-19",
    tags: ["Engineering", "Careers", "Psychology"],
    readingTime: "5 min",
    body: "An interview is a tiny sample taken under weird lighting. The best versions treat the room as a collaborative debugging session instead of a performance trap.",
    related: [{ kind: "interest", slug: "psychology" }]
  }
];

export const reading: Reading[] = [
  {
    kind: "reading",
    slug: "why-information-grows",
    title: "Why Information Grows",
    author: "Cesar Hidalgo",
    sourceUrl: "https://www.penguinrandomhouse.com/books/317011/why-information-grows-by-cesar-hidalgo/",
    dateRead: "2026-05-27",
    category: "Economics",
    summary: "A theory of economic development centered on the accumulation and embodiment of knowledge.",
    keyTakeaways: ["Knowledge is often embedded in networks, not individuals.", "Products can be read as crystallized information.", "Development depends on expanding collective capabilities."],
    thoughts: "The book is most useful as a bridge between economics, complexity, and knowledge management.",
    rating: 5,
    tags: ["Economics", "Complexity", "Knowledge"],
    related: [
      { kind: "writing", slug: "markets-and-memory" },
      { kind: "interest", slug: "economics" }
    ]
  },
  {
    kind: "reading",
    slug: "the-making-of-the-atomic-bomb",
    title: "The Making of the Atomic Bomb",
    author: "Richard Rhodes",
    sourceUrl: "https://www.simonandschuster.com/books/The-Making-of-the-Atomic-Bomb/Richard-Rhodes/9781451677614",
    dateRead: "2026-03-14",
    category: "History",
    summary: "A sweeping account of physics, war, institutions, and the uneasy birth of the nuclear age.",
    keyTakeaways: ["Scientific communities can move with astonishing speed under pressure.", "Technical progress is inseparable from political context.", "Moral clarity often arrives too late."],
    thoughts: "The book makes scale feel human without making consequence feel small.",
    rating: 5,
    tags: ["History", "Science", "Politics"],
    related: [
      { kind: "interest", slug: "science" },
      { kind: "interest", slug: "politics" }
    ]
  }
];

export const interests: Interest[] = [
  {
    kind: "interest",
    slug: "technology",
    title: "Technology",
    overview: "Tools, interfaces, infrastructure, and the ways software changes how people think and coordinate.",
    keyQuestions: ["What tools make people more capable without making them more frantic?", "Which interfaces change habits rather than merely tasks?", "How should personal software age?"],
    favoriteBooks: ["The Dream Machine", "Tools for Thought", "The Humane Interface"],
    favoriteArticles: [{ title: "The Computer for the 21st Century", href: "https://www.lri.fr/~mbl/Stanford/CS477/papers/Weiser-SciAm.pdf" }],
    favoriteThinkers: ["Douglas Engelbart", "Bret Victor", "Alan Kay"],
    currentThoughts: "The most interesting software now feels less like a destination and more like an assistant layer for thinking.",
    tags: ["AI", "Interfaces", "Tools"],
    related: [
      { kind: "project", slug: "capture-layer" },
      { kind: "writing", slug: "notes-as-working-memory" }
    ]
  },
  {
    kind: "interest",
    slug: "economics",
    title: "Economics",
    overview: "Markets, institutions, growth, incentives, and the practical mechanics of coordination.",
    keyQuestions: ["Why do some institutions learn faster than others?", "What should we measure when productivity gains are hard to see?", "Where do markets fail to price patience?"],
    favoriteBooks: ["Why Information Grows", "The Knowledge and the Wealth of Nations", "Seeing Like a State"],
    favoriteArticles: [{ title: "The Use of Knowledge in Society", href: "https://www.econlib.org/library/Essays/hykKnw.html" }],
    favoriteThinkers: ["F. A. Hayek", "Elinor Ostrom", "Cesar Hidalgo"],
    currentThoughts: "Economic life is easier to understand when knowledge, not money, is treated as the scarce substrate.",
    tags: ["Markets", "Institutions", "Growth"],
    related: [
      { kind: "reading", slug: "why-information-grows" },
      { kind: "writing", slug: "markets-and-memory" }
    ]
  },
  {
    kind: "interest",
    slug: "science",
    title: "Science",
    overview: "Scientific discovery, research cultures, measurement, and the human systems that make truth-seeking possible.",
    keyQuestions: ["How do research fields escape local maxima?", "What makes a lab or community unusually generative?", "Which discoveries needed better instruments before better theories?"],
    favoriteBooks: ["The Structure of Scientific Revolutions", "The Making of the Atomic Bomb"],
    favoriteArticles: [{ title: "You and Your Research", href: "https://www.cs.virginia.edu/~robins/YouAndYourResearch.html" }],
    favoriteThinkers: ["Thomas Kuhn", "Richard Feynman", "Vannevar Bush"],
    currentThoughts: "The social machinery around discovery is often as interesting as the discovery itself.",
    tags: ["Research", "History", "Discovery"],
    related: [{ kind: "reading", slug: "the-making-of-the-atomic-bomb" }]
  },
  {
    kind: "interest",
    slug: "politics",
    title: "Politics",
    overview: "Power, institutions, governance, state capacity, and the lived consequences of public choices.",
    keyQuestions: ["What makes institutions legitimate?", "Where does state capacity matter most?", "How do societies remember failure?"],
    favoriteBooks: ["The Origins of Political Order", "Political Order and Political Decay"],
    favoriteArticles: [{ title: "Politics and the English Language", href: "https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/politics-and-the-english-language/" }],
    favoriteThinkers: ["Francis Fukuyama", "Hannah Arendt", "James C. Scott"],
    currentThoughts: "Politics is downstream of institutions, but institutions are downstream of trust.",
    tags: ["Institutions", "Governance", "History"],
    related: [{ kind: "reading", slug: "the-making-of-the-atomic-bomb" }]
  },
  {
    kind: "interest",
    slug: "psychology",
    title: "Psychology",
    overview: "Decision-making, motivation, social behavior, and the friction between self-knowledge and action.",
    keyQuestions: ["What actually changes behavior?", "How do people maintain attention in hostile environments?", "Which rituals create better judgment?"],
    favoriteBooks: ["Thinking in Systems", "Mistakes Were Made"],
    favoriteArticles: [{ title: "How Complex Systems Fail", href: "https://how.complexsystems.fail/" }],
    favoriteThinkers: ["Daniel Kahneman", "Donella Meadows", "Robert Cialdini"],
    currentThoughts: "Good systems should assume people are variable, tired, social, and suggestible.",
    tags: ["Behavior", "Systems", "Attention"],
    related: [{ kind: "writing", slug: "interviews-as-compression" }]
  },
  ...["Business", "Entrepreneurship", "Culture", "Sports", "History", "AI"].map((title) => ({
    kind: "interest" as const,
    slug: title.toLowerCase(),
    title,
    overview: `An open notebook for questions and references around ${title.toLowerCase()}.`,
    keyQuestions: ["What is changing?", "What is durable?", "Which assumptions deserve pressure?"],
    favoriteBooks: ["To be curated"],
    favoriteArticles: [{ title: "Working list", href: "#" }],
    favoriteThinkers: ["Working list"],
    currentThoughts: "This topic is intentionally alive: a shelf for fragments before they become essays.",
    tags: [title],
    related: []
  }))
];

export const allContent = [...projects, ...writing, ...reading, ...interests];

export function getRelated(items: Relationship[]) {
  return items
    .map((item) => allContent.find((candidate) => candidate.kind === item.kind && candidate.slug === item.slug))
    .filter((item): item is (typeof allContent)[number] => Boolean(item));
}

export function searchContent(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return allContent;
  }

  return allContent.filter((item) => {
    const text = JSON.stringify(item).toLowerCase();
    return text.includes(normalized);
  });
}
