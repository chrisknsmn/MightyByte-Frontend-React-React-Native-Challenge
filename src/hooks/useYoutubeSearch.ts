// src/hooks/useYoutubeSearch.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchProgrammingVideos } from '../api/youtube';

export function useYoutubeSearch() {
  return useInfiniteQuery({
    queryKey: ['yt', 'programming'],
    queryFn: ({ pageParam }) => searchProgrammingVideos(pageParam, 16), // 4x4 grid
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
  });
}
