import * as https from 'https';
import * as http from 'http';
import { JSDOM } from 'jsdom';

/**
 * Fetches the HTML content from a given URL.
 * @param url - The URL of the webpage to fetch.
 * @returns A Promise that resolves to the HTML content as a string.
 */

export const fetchHTML = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;

        client.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to fetch page, status code: ${response.statusCode}`));
                return;
            }

            let data = '';
            response.on('data', (chunk: Buffer) => {
                data += chunk.toString();
            });

            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (err: Error) => {
            reject(err);
        });
    });
};

/**
 * Parses the HTML and extracts the title, description, and keywords.
 * @param html - The HTML content of the webpage.
 * @returns An object containing title, description, and keywords.
 */

export function parseHTMLContent(html: string): { title: string, description: string, keywords: string[] } {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract Title
    let title = document.querySelector('title')?.textContent?.trim();
    if (!title) {
        title = document.querySelector('h1')?.textContent?.trim() || 'No Title';
    }

    // Extract Description
    let description = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim();
    if (!description) {
        const firstParagraph = document.querySelector('p')?.textContent?.trim();
        description = firstParagraph ? firstParagraph.slice(0, 160) : 'No Description';
    }

    // Extract Keywords
    const contentText = document.body.textContent || '';
    const keywords = extractKeywords(contentText);

    return { title, description, keywords };
}

/**
 * Extracts keywords based on word frequency, filtering out common stopwords.
 * @param content - The full text content of the page.
 * @returns An array of keywords based on frequency.
 */

function extractKeywords(content: string): string[] {
    const stopwords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'is', 'of', 'to', 'with', 'in', 'on', 'for', 'by', 'from',
        'it', 'this', 'that', 'these', 'those', 'he', 'she', 'they', 'we', 'us', 'his', 'her', 'their', 'our', 'at',
        'as', 'into', 'like', 'through', 'over', 'before', 'between', 'after', 'since', 'without', 'about', 'within'
    ]);

    const words = content.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const frequencyMap: { [word: string]: number } = {};

    words.forEach(word => {
        if (!stopwords.has(word)) {
            frequencyMap[word] = (frequencyMap[word] || 0) + 1;
        }
    });

    const sortedKeywords = Object.entries(frequencyMap)
        .sort(([, a], [, b]) => b - a)  // Sort by frequency, descending
        .slice(0, 10)                   // Get top 10 keywords
        .map(([word]) => word);

    return sortedKeywords;
}

/**
 * Extracts the hostname from a given URL.
 * @param url - The URL from which to extract the hostname.
 * @returns The hostname of the URL.
 * @throws Will throw an error if the URL is invalid.
 */

export function getHostname(url: string): string {
    try {
        // Create a new URL object
        const parsedUrl = new URL(url);
        // Return the hostname
        return parsedUrl.hostname;
    } catch (error) {
        throw new Error(`Invalid URL: ${url}`);
    }
}