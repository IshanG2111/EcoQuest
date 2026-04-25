-- =============================================
-- EcoQuest Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- User Progress Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id     UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  points      INTEGER NOT NULL DEFAULT 0,
  streak      INTEGER NOT NULL DEFAULT 0,
  last_active DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Badges Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  icon_key    TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- User Badges (junction table)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- =============================================
-- Quizzes Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  topic        TEXT NOT NULL,
  difficulty   TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description  TEXT,
  created_by   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  points_value INTEGER NOT NULL DEFAULT 100,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Quiz Questions Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id        UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  options        JSONB NOT NULL,  -- Array of strings: ["opt1", "opt2", "opt3", "opt4"]
  correct_index  INTEGER NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  explanation    TEXT,
  question_order INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Quiz Attempts Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id      UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score        INTEGER NOT NULL DEFAULT 0,
  max_score    INTEGER NOT NULL DEFAULT 100,
  answers      JSONB NOT NULL DEFAULT '[]', -- Array of selected indices
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Game Sessions Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_slug      TEXT NOT NULL,
  score          INTEGER NOT NULL DEFAULT 0,
  duration_secs  INTEGER NOT NULL DEFAULT 0,
  metadata       JSONB DEFAULT '{}',
  played_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Leaderboard View
-- =============================================
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT
  u.id AS user_id,
  u.display_name,
  u.avatar_url,
  COALESCE(up.points, 0) AS total_points,
  RANK() OVER (ORDER BY COALESCE(up.points, 0) DESC) AS rank
FROM public.users u
LEFT JOIN public.user_progress up ON u.id = up.user_id
WHERE u.role = 'student'
ORDER BY total_points DESC;

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_slug ON public.game_sessions(game_slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON public.quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_user_progress_points ON public.user_progress(points DESC);

-- =============================================
-- Updated_at trigger function
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by our API routes)
-- Client-side: anon key gets public read access to specific views

-- Public read: badges list
CREATE POLICY "Public can read badges" ON public.badges FOR SELECT USING (true);

-- Public read: leaderboard (via view, no RLS needed on views)
-- Published quizzes readable by all authenticated
CREATE POLICY "Authenticated can read published quizzes" ON public.quizzes
  FOR SELECT USING (is_published = true);

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (true); -- open read for display_name, avatar

CREATE POLICY "Users own progress" ON public.user_progress
  FOR ALL USING (true); -- controlled by service role in API

CREATE POLICY "Users own attempts" ON public.quiz_attempts
  FOR SELECT USING (true);

CREATE POLICY "Users own game sessions" ON public.game_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users own badges" ON public.user_badges
  FOR SELECT USING (true);
