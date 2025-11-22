import { useEffect } from 'react';
import { useAuthStore } from '@/core/auth/authStore';
import { updateFavicon, resetFavicon } from '@/common/utils/favicon';

/**
 * Hook to manage favicon based on current branch
 * Updates favicon emoji based on branch type (SCHOOL/COLLEGE)
 */
export function useFavicon() {
  const { currentBranch, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && currentBranch) {
      updateFavicon(currentBranch);
    } else {
      resetFavicon();
    }
  }, [currentBranch, isAuthenticated]);
}

