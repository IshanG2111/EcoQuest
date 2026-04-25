'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface LeaderboardEntry {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    total_points: number;
    rank: number;
}

export interface LeaderboardData {
    leaderboard: LeaderboardEntry[];
    currentUser: LeaderboardEntry | null;
}

/**
 * Hook to get the live leaderboard from the database.
 * @param limit Number of entries to fetch (default 10)
 */
export function useLeaderboard(limit = 10) {
    const { data, error, isLoading, mutate } = useSWR<LeaderboardData>(
        `/api/leaderboard?limit=${limit}`,
        fetcher,
        {
            revalidateOnFocus: true,
            refreshInterval: 60000, // auto-refresh every 60s
        }
    );

    return {
        leaderboard: data?.leaderboard ?? [],
        currentUser: data?.currentUser ?? null,
        isLoading,
        isError: !!error,
        mutate,
    };
}
