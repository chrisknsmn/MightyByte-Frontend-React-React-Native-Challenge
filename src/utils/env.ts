// src/utils/env.ts
export function getYoutubeApiKey(): string | undefined {
  const fromEnv =
    (typeof process !== 'undefined' && (process as any).env?.YT_API_KEY) ||
    (typeof import_meta !== 'undefined' && (import_meta as any).env?.YT_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.YT_API_KEY);

  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();

  if (typeof window !== 'undefined') {
    const ls = window.localStorage.getItem('YT_API_KEY');
    if (ls && ls.trim()) return ls.trim();
  }
  return undefined;
}
