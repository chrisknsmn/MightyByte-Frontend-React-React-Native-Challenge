// src/api/youtube.ts
import { getYoutubeApiKey } from '../utils/env';

export type YTSearchItem = {
  id: { kind: string; videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width?: number; height?: number };
    };
  };
};

export type YTSearchPage = {
  items: YTSearchItem[];
  nextPageToken?: string;
};

const BASE = 'https://www.googleapis.com/youtube/v3/search';

// Mock data for when API quota is exceeded
function generateMockData(pageNumber: number, maxResults: number): YTSearchPage {
  const items: YTSearchItem[] = [];

  // Using a JavaScript tutorial video as test video
  const testVideoId = 'W6NZfCO5SIk'; // JavaScript Programming Tutorial

  for (let i = 0; i < maxResults; i++) {
    const index = pageNumber * maxResults + i;
    items.push({
      id: {
        kind: 'youtube#video',
        videoId: testVideoId
      },
      snippet: {
        title: `Test Programming Video #${index + 1} - Demo Content`,
        channelTitle: `Demo Channel ${(index % 10) + 1}`,
        publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnails: {
          medium: {
            url: `https://i.ytimg.com/vi/${testVideoId}/mqdefault.jpg`,
            width: 320,
            height: 180,
          },
          high: {
            url: `https://i.ytimg.com/vi/${testVideoId}/hqdefault.jpg`,
            width: 480,
            height: 360,
          },
        },
      },
    });
  }

  return {
    items,
    nextPageToken: pageNumber < 5 ? `page_${pageNumber + 1}` : undefined,
  };
}

export async function searchProgrammingVideos(
  pageToken?: string,
  maxResults = 50
): Promise<YTSearchPage> {
  const key = getYoutubeApiKey();
  if (!key) throw new Error('Missing YT API key');

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: 'programming',
    maxResults: String(maxResults),
    key,
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`${BASE}?${params.toString()}`);

  // If quota exceeded or forbidden, return mock data
  if (res.status === 403 || res.status === 429) {
    console.warn('YouTube API quota exceeded or forbidden. Using mock data.');
    const pageNumber = pageToken ? parseInt(pageToken.split('_')[1]) || 0 : 0;
    return generateMockData(pageNumber, maxResults);
  }

  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  return res.json();
}
