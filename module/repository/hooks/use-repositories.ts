"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchRepositories } from "../actions";


// useInfiniteQuery TanStack Query ka wo hook hai jo Infinite Scroll (jaise Instagram/Twitter ki feed) ya "Load More" button waale pagination ke liye specifically banaya gaya hai.


// {
//   pages: [
//     { items: [repo1, repo2, repo3], nextCursor: 2 } // Page 1 ka complete API response
//   ],
//   pageParams: [1]
// }

export const useRepositories = () => {

  return useInfiniteQuery({
    queryKey: ["repositories"],
    queryFn: async ({ pageParam}) => {
      const data = await fetchRepositories(pageParam, 10);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};
