'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GuestProgressData {
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
  quizzesCompleted: string[];
}

const STORAGE_KEY = 'ecoquest_guest_progress';

const DEFAULT_PROGRESS: GuestProgressData = {
  points: 0,
  streak: 0,
  last_active: null,
  badges: [],
  quizzesCompleted: [],
};

function loadProgress(): GuestProgressData {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveProgress(data: GuestProgressData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Hook for managing guest user progress using local storage.
 * Provides the same interface shape as useUserProgress for consistency.
 */
export function useGuestProgress() {
  const [progress, setProgress] = useState<GuestProgressData>(DEFAULT_PROGRESS);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    saveProgress(progress);
  }, [progress, isInitialized]);

  const addPoints = useCallback((amount: number) => {
    setProgress(prev => ({
      ...prev,
      points: prev.points + amount,
      last_active: new Date().toISOString(),
    }));
  }, []);

  const incrementStreak = useCallback(() => {
    setProgress(prev => {
      const lastActive = prev.last_active ? new Date(prev.last_active) : null;
      const now = new Date();
      const isConsecutiveDay = lastActive
        ? (now.getTime() - lastActive.getTime()) < 48 * 60 * 60 * 1000
        : true;

      return {
        ...prev,
        streak: isConsecutiveDay ? prev.streak + 1 : 1,
        last_active: now.toISOString(),
      };
    });
  }, []);

  const addBadge = useCallback((badge: GuestProgressData['badges'][0]) => {
    setProgress(prev => {
      if (prev.badges.some(b => b.id === badge.id)) return prev;
      return {
        ...prev,
        badges: [...prev.badges, badge],
      };
    });
  }, []);

  const markQuizCompleted = useCallback((quizId: string) => {
    setProgress(prev => {
      if (prev.quizzesCompleted.includes(quizId)) return prev;
      return {
        ...prev,
        quizzesCompleted: [...prev.quizzesCompleted, quizId],
      };
    });
  }, []);

  const getProgressForApi = useCallback(() => {
    return {
      points: progress.points,
      streak: progress.streak,
      last_active: progress.last_active,
      badges: progress.badges,
    };
  }, [progress]);

  return {
    progress,
    isLoading: !isInitialized,
    addPoints,
    incrementStreak,
    addBadge,
    markQuizCompleted,
    getProgressForApi,
  };
}
