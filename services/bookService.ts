import { Book, ParsedBook, Chapter } from "../types";

const GUTENDEX_API = "https://gutendex.com/books";

export const searchBooks = async (query: string, language: string = 'fr'): Promise<Book[]> => {
  if (!query) return [];
  // Append language filter to the API request
  const response = await fetch(`${GUTENDEX_API}?search=${encodeURIComponent(query)}&languages=${language}`);
  const data = await response.json();
  return data.results;
};

export const fetchBookContent = async (url: string): Promise<string> => {
  // Force HTTPS to avoid mixed content issues
  const targetUrl = url.replace(/^http:\/\//i, 'https://');
  
  // Strategy: Try multiple CORS proxies in a specific order
  const proxies = [
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`
  ];

  for (const createProxyUrl of proxies) {
    try {
      const proxyUrl = createProxyUrl(targetUrl);
      console.log(`Tentative via proxy: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const text = await response.text();
        // Validation: Ensure we didn't get an HTML error page
        if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
          console.warn("Le proxy a renvoyé du HTML au lieu du texte brut.");
          continue;
        }
        
        if (text.length > 500) {
          return text;
        }
      }
    } catch (error) {
      console.warn(`Erreur proxy:`, error);
    }
  }

  throw new Error("Impossible de récupérer le contenu du livre. Les serveurs Project Gutenberg limitent parfois l'accès. Veuillez réessayer dans quelques instants.");
};

// Advanced parsing logic
export const parseGutenbergText = (rawText: string, metadata: Book): ParsedBook => {
  // 1. Heavy Cleanup: Normalize line endings and multiple spaces
  let content = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Fix broken word wraps in Gutenberg (lines ending with hyphens)
    // .replace(/(\w)-\n(\w)/g, '$1$2') // Risky if not carefully done, skipping for now
    .replace(/\n\n+/g, '\n\n'); // Max 2 newlines

  // 2. Remove Gutenberg Header/Footer
  const startMarker = /\*\*\* ?START OF THE PROJECT GUTENBERG EBOOK .* \*\*\*/i;
  const endMarker = /\*\*\* ?END OF THE PROJECT GUTENBERG EBOOK .* \*\*\*/i;

  const startMatch = content.match(startMarker);
  if (startMatch && startMatch.index !== undefined) {
    content = content.substring(startMatch.index + startMatch[0].length);
  }

  const endMatch = content.match(endMarker);
  if (endMatch && endMatch.index !== undefined) {
    content = content.substring(0, endMatch.index);
  }
  
  content = content.trim();

  // 3. Robust Chapter Splitter
  // Patterns to look for:
  // "CHAPTER I", "Chapitre 1", "LIVRE PREMIER", "PART II", "I." (Roman numeral alone)
  // Must be surrounded by newlines
  const chapterRegex = /(?:\n\n|^)\s*(?:CHAPTER|CHAPITRE|PART|PARTIE|LIVRE|BOOK|SCÈNE|ACTE)\s+(?:[IVXLCDM0-9A-Z]+|(?:PREMIER|DEUXIÈME|TROISIÈME|QUATRIÈME|CINQUIÈME|SIXIÈME|SEPTIÈME|HUITIÈME|NEUVIÈME|DIXIÈME|UN|DEUX|TROIS)).{0,100}(?:\n|$)/gi;
  
  // Roman Numeral standalone fallback (e.g. "   I.   ")
  const romanRegex = /(?:\n\n|^)\s*[IVXLCDM]+\.?\s*(?:\n|$)/g;

  let parts: string[] = [];
  let splitterUsed = 'standard';

  // Try standard detailed regex first
  let splitParts = content.split(chapterRegex);
  
  // Keep the delimiters to know the titles. 
  // JS split excludes delimiters unless caught in capturing group, so let's matchAll instead to reconstruct
  
  const chapters: Chapter[] = [];
  
  // Strategy: Find all matches of headings
  let matches = [...content.matchAll(chapterRegex)];
  
  // If too few matches, try strict Roman numerals (common in older books)
  if (matches.length < 3) {
     matches = [...content.matchAll(romanRegex)];
     splitterUsed = 'roman';
  }

  if (matches.length === 0) {
    // Fallback: One big chapter
    chapters.push({ title: "Texte Complet", content: content });
  } else {
    // Process matches
    // Add preamble (text before first chapter)
    if (matches[0].index && matches[0].index > 50) {
      chapters.push({ 
        title: "Introduction", 
        content: content.substring(0, matches[0].index).trim() 
      });
    }

    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];
      
      const title = currentMatch[0].trim();
      const startIndex = (currentMatch.index || 0) + currentMatch[0].length;
      const endIndex = nextMatch ? nextMatch.index : content.length;
      
      const body = content.substring(startIndex, endIndex).trim();
      
      if (body.length > 50) { // Ignore empty chapters
        chapters.push({ title, content: body });
      }
    }
  }

  return {
    title: metadata.title,
    author: metadata.authors.map(a => a.name).join(", "),
    chapters,
    fullText: content
  };
};