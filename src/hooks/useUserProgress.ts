'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
 * Automatically re-fetches when called with mutate().
 */
export function useUserProgress() {
    const { data, error, isLoading, mutate } = useSWR<UserProgressData>(
        '/api/user/progress',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000, // 30s
        }
    );

    return {
        progress: data,
        isLoading,
        isError: !!error,
        mutate,
    };
}
