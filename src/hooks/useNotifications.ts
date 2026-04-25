'use client';

import useSWR from 'swr';

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch notifications');
    }
    return response.json();
};

export interface NotificationItem {
    id: string;
    type: 'badge' | 'game' | 'quiz' | 'progress' | 'system';
    title: string;
    message: string;
    is_read: boolean;
    metadata?: Record<string, unknown>;
    created_at: string;
}

interface NotificationResponse {
    notifications: NotificationItem[];
    unreadCount: number;
}

export function useNotifications(limit = 8) {
    const { data, error, isLoading, mutate } = useSWR<NotificationResponse>(
        `/api/user/notifications?limit=${limit}`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 15000,
        }
    );

    const markAsRead = async (notificationId: string) => {
        const response = await fetch('/api/user/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId }),
        });

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }

        await mutate();
    };

    const markAllAsRead = async () => {
        const response = await fetch('/api/user/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAll: true }),
        });

        if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
        }

        await mutate();
    };

    return {
        notifications: data?.notifications ?? [],
        unreadCount: data?.unreadCount ?? 0,
        isLoading,
        isError: !!error,
        markAsRead,
        markAllAsRead,
        mutate,
    };
}
