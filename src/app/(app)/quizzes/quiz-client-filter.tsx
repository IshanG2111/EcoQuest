'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  HelpCircle,
  Award,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface QuizItem {
  id: string;
  title: string;
  topic: string;
  description: string;
  difficulty: string;
  points_value: number;
  question_count: number;
  estimated_time: string;
}

interface QuizClientFilterProps {
  quizzes: QuizItem[];
  topics: string[];
}

export const QuizClientFilter: React.FC<QuizClientFilterProps> = ({ quizzes, topics }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchQuery =
        !searchQuery.trim() ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const matchTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      const matchDifficulty =
        selectedDifficulty === 'all' ||
        q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchQuery && matchTopic && matchDifficulty;
    });
  }, [quizzes, searchQuery, selectedTopic, selectedDifficulty]);

  const getDifficultyBadge = (difficulty: string) => {
    const d = difficulty.toLowerCase();
    if (d === 'beginner' || d === 'easy') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-medium">
          ★ Novice
        </span>
      );
    }
    if (d === 'advanced' || d === 'hard') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-[10px] font-mono text-rose-400 font-medium">
          ★★★ Master
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400 font-medium">
        ★★ Adept
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ─── Filter & Search Bar ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0c1017]/80 p-2.5 rounded-2xl border border-zinc-800/80 backdrop-blur-xl">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules by keyword or topic..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 transition font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Topic Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans whitespace-nowrap transition cursor-pointer ${
              selectedTopic === 'all'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            All Topics ({quizzes.length})
          </button>

          {topics.slice(0, 4).map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans whitespace-nowrap transition cursor-pointer ${
                selectedTopic === topic
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Quiz Cards Grid ─── */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#0c1017]/60 rounded-2xl border border-zinc-800/60">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No matching modules found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            Try adjusting your search query or removing active topic filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTopic('all');
              setSelectedDifficulty('all');
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-emerald-400 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-[#0c1017]/95 hover:bg-[#0f1420] border border-zinc-800/80 hover:border-emerald-500/40 shadow-xl transition-all duration-200 overflow-hidden"
            >
              {/* Subtle top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="p-5 space-y-3.5 flex-1">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 font-medium">
                    {quiz.topic}
                  </span>
                  {getDifficultyBadge(quiz.difficulty)}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{quiz.question_count} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>~{quiz.estimated_time}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-4 pt-0">
                <Link
                  href={`/learn/quiz/${quiz.id}`}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900/90 group-hover:bg-emerald-500 border border-zinc-800 group-hover:border-emerald-400 text-xs font-semibold text-zinc-200 group-hover:text-black transition-all shadow-md"
                >
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400 group-hover:text-black transition-colors" />
                    <span className="font-mono font-bold">+{quiz.points_value} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-sans">
                    <span>Start Module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
