'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  RotateCcw,
  Clock,
  Flame,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Desktop } from '@/components/desktop';
import { useToast } from '@/hooks/use-toast';

type Question = {
  id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  question_order: number;
};

type Quiz = {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  description: string;
  learning_material?: string;
  points_value: number;
  quiz_questions: Question[];
};

export default function QuizPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<'reading' | 'quiz' | 'finished'>('reading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Quiz not found');
          throw new Error('Failed to fetch quiz');
        }
        const data = await res.json();
        setQuiz(data);

        // If there's no learning material, skip reading mode
        if (!data.learning_material) {
          setMode('quiz');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [id]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed) return;
    setSelectedAnswerIndex(idx);
    setIsAnswerRevealed(true);
  };

  const handleNextQuestion = async () => {
    if (!quiz) return;

    const currentQuestion = quiz.quiz_questions[currentQuestionIndex];
    let newScore = score;

    if (selectedAnswerIndex === currentQuestion.correct_index) {
      newScore += 1;
      setScore(newScore);
    }

    setSelectedAnswerIndex(null);
    setIsAnswerRevealed(false);

    if (currentQuestionIndex < quiz.quiz_questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await submitAttempt(newScore);
    }
  };

  const submitAttempt = async (finalScore: number) => {
    if (!quiz) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScore,
          max_score: quiz.quiz_questions.length,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.error.includes('already completed')) {
          toast({ title: 'Completed', description: 'You have already earned points for this module.' });
        } else {
          throw new Error(data.error || 'Failed to submit attempt');
        }
      } else {
        setPointsEarned(data.ecoPointsEarned || quiz.points_value);
        toast({ title: 'Module Mastered!', description: data.message });
      }

      setMode('finished');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
      setMode('finished');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Desktop>
      <div className="max-w-4xl mx-auto py-4 px-4 font-sans text-zinc-100 min-h-[80vh] flex flex-col justify-center">
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-xs font-mono text-zinc-500">Decrypting Ecological Briefing...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && (error || !quiz) && (
          <div className="p-8 rounded-2xl bg-[#0c1017]/95 border border-rose-500/30 text-center space-y-4 max-w-md mx-auto shadow-2xl backdrop-blur-xl">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Module Unavailable</h2>
            <p className="text-xs text-zinc-400">{error || "Could not locate this learning module."}</p>
            <Link
              href="/quizzes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Academy</span>
            </Link>
          </div>
        )}

        {/* Phase 1: Reading Briefing */}
        {!loading && quiz && mode === 'reading' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c1017]/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold">
                    {quiz.topic}
                  </span>
                  <span className="text-zinc-500 text-xs font-mono">FIELD BRIEFING</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-snug">{quiz.title}</h1>
                <p className="text-zinc-400 text-xs">{quiz.description}</p>
              </div>

              <Link
                href="/quizzes"
                className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modules</span>
              </Link>
            </div>

            {/* Reading Content */}
            <div className="p-6 md:p-8 rounded-2xl bg-[#0c1017]/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl">
              <div
                className="prose prose-invert max-w-none prose-emerald
                           prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                           prose-p:text-zinc-300 prose-p:text-sm prose-p:leading-relaxed
                           prose-a:text-emerald-400 hover:prose-a:text-emerald-300
                           prose-li:text-zinc-300 prose-li:text-sm"
                dangerouslySetInnerHTML={{ __html: quiz.learning_material || '' }}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0c1017]/90 border border-zinc-800/80 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Read carefully before testing your knowledge</span>
              </div>

              <button
                onClick={() => setMode('quiz')}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-sans flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition cursor-pointer"
              >
                <span>Start Knowledge Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Active Quiz Questions */}
        {!loading && quiz && mode === 'quiz' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Progress Top Bar */}
            <div className="p-4 rounded-2xl bg-[#0c1017]/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                  {currentQuestionIndex + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Question {currentQuestionIndex + 1} of {quiz.quiz_questions.length}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">{quiz.title}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  Score: {score}/{quiz.quiz_questions.length}
                </span>
              </div>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-sky-400 h-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + (isAnswerRevealed ? 1 : 0)) / quiz.quiz_questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Card */}
            {quiz.quiz_questions[currentQuestionIndex] && (
              <div className="p-6 md:p-8 rounded-2xl bg-[#0c1017]/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl space-y-6">
                <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                  {quiz.quiz_questions[currentQuestionIndex].question_text}
                </h2>

                {/* Option Buttons */}
                <div className="space-y-3">
                  {quiz.quiz_questions[currentQuestionIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswerIndex === idx;
                    const isCorrect = idx === quiz.quiz_questions[currentQuestionIndex].correct_index;
                    const optionLetter = String.fromCharCode(65 + idx);

                    let btnStyles = 'bg-zinc-900/90 hover:bg-zinc-800/80 border-zinc-800 text-zinc-300';

                    if (isAnswerRevealed) {
                      if (isCorrect) {
                        btnStyles = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                      } else if (isSelected && !isCorrect) {
                        btnStyles = 'bg-rose-500/20 border-rose-500/60 text-rose-300';
                      }
                    } else if (isSelected) {
                      btnStyles = 'bg-emerald-500/20 border-emerald-500 text-white font-semibold';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerRevealed}
                        className={`w-full p-4 rounded-xl border text-left transition flex items-center justify-between gap-3 text-xs md:text-sm font-sans cursor-pointer ${btnStyles}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-xs flex items-center justify-center flex-shrink-0">
                            {optionLetter}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isAnswerRevealed && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                        {isAnswerRevealed && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Callout */}
                {isAnswerRevealed && quiz.quiz_questions[currentQuestionIndex].explanation && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-zinc-300 space-y-1 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ecological Context</span>
                    </div>
                    <p className="leading-relaxed">
                      {quiz.quiz_questions[currentQuestionIndex].explanation}
                    </p>
                  </div>
                )}

                {/* Next / Submit Button */}
                {isAnswerRevealed && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-sans flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition cursor-pointer"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : currentQuestionIndex < quiz.quiz_questions.length - 1 ? (
                        <>
                          <span>Next Question</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Complete Module</span>
                          <Award className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Module Completion & XP Summary */}
        {!loading && quiz && mode === 'finished' && (
          <div className="p-8 md:p-12 rounded-3xl bg-[#0c1017]/98 border border-zinc-800/90 shadow-2xl backdrop-blur-2xl text-center space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-200">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Award className="w-10 h-10" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-white tracking-tight">Module Completed!</h2>
              <p className="text-xs text-zinc-400">
                You scored <span className="text-white font-bold">{score}</span> out of{' '}
                <span className="text-white font-bold">{quiz.quiz_questions.length}</span> on{' '}
                <span className="text-emerald-400 font-semibold">{quiz.title}</span>.
              </p>
            </div>

            {/* XP Awarded Badge */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center gap-3">
              <Flame className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Planetary XP Awarded</div>
                <div className="text-lg font-bold text-amber-400 font-mono">+{pointsEarned || quiz.points_value} XP</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/quizzes"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Explore More Modules</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setSelectedAnswerIndex(null);
                  setIsAnswerRevealed(false);
                  setScore(0);
                  setMode('quiz');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </Desktop>
  );
}
