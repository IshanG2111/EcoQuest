'use client';

import useSWR from 'swr';
import { useAuth } from '@/hooks/use-auth';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CACHE_KEY = 'ecoquest_progress_cache';

function getCachedProgress() {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function setCachedProgress(data: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

export interface UserProgressData {
    points: number;
    streak: number;
    last_active: string | null;
    badges: Array<{
        id: string;
        name: string;
        icon_key: string;
        description: string;
        earned_at: string;
    }>;
}

/**
 * Hook to get the current user's eco points, streak, and badges.
 * Uses localStorage cache as fallback data to prevent loading flash.
 * Only fetches when user is authenticated.
 */
export function useUserProgress() {
    const { isGuest } = useAuth();

    const { data, error, isLoading, mutate } = useSWR<UserProgressData>(
        isGuest ? null : '/api/user/progress',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000, // 30s
            fallbackData: getCachedProgress(),
            onSuccess: (data) => {
                if (data) setCachedProgress(data);
            },
        }
    );

    return {
        progress: data,
        isLoading: isGuest ? false : isLoading,
        isError: !!error,
        mutate,
    };
}
