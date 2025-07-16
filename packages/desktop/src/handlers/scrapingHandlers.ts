import { ipcMain } from 'electron';
import * as cheerio from 'cheerio';

interface ScrapedArticle {
  title: string;
  content: string;
  author?: string;
  publishedDate?: string;
  imageUrl?: string;
}

export function registerScrapingHandlers(): void {
  ipcMain.handle('scrape:article', async (event, url: string): Promise<ScrapedArticle> => {
    try {
      console.log('🔍 Scraping article:', url);
      
      // Use cheerio with static import
      
      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract title
      let title = '';
      const titleSelectors = [
        'h1',
        'title',
        '[property="og:title"]',
        '[name="twitter:title"]',
        '.entry-title',
        '.post-title',
        '.article-title'
      ];
      
      for (const selector of titleSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          title = element.attr('content') || element.text().trim();
          if (title) break;
        }
      }

      // Extract content
      let content = '';
      const contentSelectors = [
        'article',
        '.entry-content',
        '.post-content',
        '.article-content',
        '.content',
        'main',
        '.post-body',
        '.entry-body'
      ];

      for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          // Remove script, style, and other unwanted elements
          element.find('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share').remove();
          content = element.text().trim();
          if (content && content.length > 100) break;
        }
      }

      // Fallback: get all paragraph text
      if (!content || content.length < 100) {
        content = $('p').map((_, el) => $(el).text().trim()).get().join(' ').trim();
      }

      // Extract author
      let author = '';
      const authorSelectors = [
        '[property="article:author"]',
        '[name="author"]',
        '.author',
        '.byline',
        '.post-author',
        '.article-author'
      ];

      for (const selector of authorSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          author = element.attr('content') || element.text().trim();
          if (author) break;
        }
      }

      // Extract published date
      let publishedDate = '';
      const dateSelectors = [
        '[property="article:published_time"]',
        '[name="publish_date"]',
        'time[datetime]',
        '.date',
        '.post-date',
        '.published'
      ];

      for (const selector of dateSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          publishedDate = element.attr('datetime') || element.attr('content') || element.text().trim();
          if (publishedDate) break;
        }
      }

      // Extract image
      let imageUrl = '';
      const imageSelectors = [
        '[property="og:image"]',
        '[name="twitter:image"]',
        'article img',
        '.featured-image img',
        '.post-image img'
      ];

      for (const selector of imageSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          imageUrl = element.attr('content') || element.attr('src') || '';
          if (imageUrl) {
            // Make sure it's an absolute URL
            if (imageUrl.startsWith('/')) {
              const urlObj = new URL(url);
              imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
            }
            break;
          }
        }
      }

      // Clean up content
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      // Limit content length
      if (content.length > 5000) {
        content = content.substring(0, 5000) + '...';
      }

      const result: ScrapedArticle = {
        title: title || 'Article sans titre',
        content: content || 'Contenu non disponible',
        author: author || undefined,
        publishedDate: publishedDate || undefined,
        imageUrl: imageUrl || undefined
      };

      console.log('✅ Article scrapé avec succès:', result.title);
      return result;

    } catch (error) {
      console.error('❌ Erreur lors du scraping:', error);
      throw new Error(`Impossible de scraper l'article: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}