'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseGameSessionTrackerParams {
  gameSlug: string;
  isPlaying: boolean;
  isFinished?: boolean;
  score: number;
  metadata?: Record<string, unknown>;
}

export function useGameSessionTracker({
  gameSlug,
  isPlaying,
  isFinished = false,
  score,
  metadata = {},
}: UseGameSessionTrackerParams) {
  const startedAtRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

  const submitSession = useCallback(
    async (withKeepalive = false) => {
      if (submittedRef.current || score <= 0 || !startedAtRef.current) {
        return;
      }

      const duration_secs = Math.max(
        0,
        Math.round((Date.now() - startedAtRef.current) / 1000)
      );

      try {
        const response = await fetch('/api/games/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_slug: gameSlug,
            score,
            duration_secs,
            metadata,
          }),
          keepalive: withKeepalive,
          credentials: 'include',
        });

        if (response.ok) {
          submittedRef.current = true;
        }
      } catch {
        // Ignore network/page transition failures.
      }
    },
    [gameSlug, metadata, score]
  );

  useEffect(() => {
    if (isPlaying && !startedAtRef.current) {
      startedAtRef.current = Date.now();
      submittedRef.current = false;
      return;
    }

    if (!isPlaying && !isFinished) {
      startedAtRef.current = null;
      submittedRef.current = false;
    }
  }, [isPlaying, isFinished]);

  useEffect(() => {
    if (isFinished) {
      void submitSession();
    }
  }, [isFinished, submitSession]);

  useEffect(() => {
    const handlePageHide = () => {
      if (isPlaying && !submittedRef.current && score > 0) {
        void submitSession(true);
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      handlePageHide();
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isPlaying, score, submitSession]);

  return { submitSession };
}
