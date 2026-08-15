import { useQuery } from '@tanstack/react-query';
import { getVariants } from '@/lib/firebase';

export const useVariants = () => {
  const query = useQuery({
    queryKey: ["variants"],
    queryFn: getVariants,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    initialData: [],
    initialDataUpdatedAt: 0,
    experimental_prefetchInRender: true,
  });

  return {
    ...query,
    // initialData is [] with updatedAt 0; a real fetch or cache hit sets this above 0
    isReady: query.dataUpdatedAt > 0,
  };
}; 