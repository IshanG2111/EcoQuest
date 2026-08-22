import React from 'react';
import Link from 'next/link';
import { Desktop } from '@/components/desktop';
import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import {
  BookOpen,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  HelpCircle,
  Flame,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { QuizClientFilter } from './quiz-client-filter';

export const dynamic = 'force-dynamic';

export default async function QuizzesPage() {
  await connectDB();

  // Fetch published quizzes from database
  const rawQuizzes = await Quiz.find({ is_published: true })
    .select('_id title topic description difficulty points_value quiz_questions')
    .sort({ createdAt: -1 })
    .lean();

  const quizzes = rawQuizzes.map((q: any) => ({
    id: q._id.toString(),
    title: q.title,
    topic: q.topic || 'General Ecology',
    description: q.description || `Explore vital concepts and strategies in ${q.topic || 'sustainability'}.`,
    difficulty: q.difficulty || 'Intermediate',
    points_value: q.points_value || 100,
    question_count: q.quiz_questions?.length || 5,
    estimated_time: `${Math.max(2, Math.round((q.quiz_questions?.length || 5) * 0.8))} min`,
  }));

  // Calculate library telemetry
  const totalQuizzes = quizzes.length;
  const totalXPAvailable = quizzes.reduce((sum: number, q: any) => sum + (q.points_value || 0), 0);
  const topics = Array.from(new Set(quizzes.map((q: any) => q.topic))).filter(Boolean) as string[];

  return (
    <Desktop>
      <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
        
        {/* ─── Hero Header & Knowledge Telemetry Bar ─── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1017]/95 via-[#0f1420]/90 to-[#0c1017]/95 border border-zinc-800/90 shadow-2xl p-6 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  KNOWLEDGE REPOSITORY
                </span>
                <span className="text-zinc-500 text-xs font-mono">v3.4 // ACTIVE</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
                Ecological Academy & Quizzes
              </h1>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Read scientific field briefings, master sustainability principles, and verify your expertise to earn Planetary XP and unlock rank achievements.
              </p>
            </div>

            {/* Quick Stat Chips */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex items-center gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Modules</div>
                  <div className="text-sm font-bold text-white font-mono">{totalQuizzes} Available</div>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex items-center gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Total Bounty</div>
                  <div className="text-sm font-bold text-amber-400 font-mono">+{totalXPAvailable.toLocaleString()} XP</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Client Filter & Card Grid ─── */}
        <QuizClientFilter quizzes={quizzes} topics={topics} />

      </div>
    </Desktop>
  );
}
