// src/hooks/useYoutubeSearch.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchProgrammingVideos } from '../api/youtube';

export function useYoutubeSearch() {
  return useInfiniteQuery({
    queryKey: ['yt', 'programming'],
    queryFn: ({ pageParam }) => searchProgrammingVideos(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
  });
}
