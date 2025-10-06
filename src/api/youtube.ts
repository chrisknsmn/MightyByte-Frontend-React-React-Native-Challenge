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
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  return res.json();
}
