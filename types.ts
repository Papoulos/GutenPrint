export interface Book {
  id: number;
  title: string;
  authors: Author[];
  formats: Record<string, string>;
  download_count: number;
  languages: string[];
}

export interface Author {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

export interface ParsedBook {
  title: string;
  author: string;
  chapters: Chapter[];
  fullText: string;
}

export interface Chapter {
  title: string;
  content: string; // The text content of the chapter
}

export interface AIAnalysis {
  summary: string;
  themes: string[];
  readingLevel: string;
  mood: string;
}