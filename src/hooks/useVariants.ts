import { useQuery } from '@tanstack/react-query';
import { getVariants } from '@/lib/firebase';

export const useVariants = () => {
  const query = useQuery({
    queryKey: ["variants"],
    queryFn: getVariants,
    // Short, because variants carry live stock: refetches on mount/focus once older than this
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: true, // global default is off; stock should catch up when a customer returns to the tab
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