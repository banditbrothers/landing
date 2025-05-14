import { useQuery } from '@tanstack/react-query';
import { getVariants } from '@/lib/firebase';

export const useVariants = () => {
  return useQuery({
    queryKey: ['variants'],
    queryFn: getVariants,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}; 