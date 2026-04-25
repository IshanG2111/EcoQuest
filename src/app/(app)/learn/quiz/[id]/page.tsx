'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
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

  const handleNextQuestion = async () => {
    if (!quiz) return;

    const currentQuestion = quiz.quiz_questions[currentQuestionIndex];
    let newScore = score;
    
    if (selectedAnswerIndex === currentQuestion.correct_index) {
      newScore += 1;
      setScore(newScore);
    }
    
    setSelectedAnswerIndex(null);

    if (currentQuestionIndex < quiz.quiz_questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz finished, submit attempt
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
        // If they already took it, just show finished screen without points
        if (data.error && data.error.includes('already completed')) {
            toast({ title: 'Notice', description: 'You have already completed this quiz. No new points awarded.'});
        } else {
            throw new Error(data.error || 'Failed to submit attempt');
        }
      } else {
        setPointsEarned(data.ecoPointsEarned);
        toast({ title: 'Success', description: data.message });
      }
      
      setMode('finished');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
      // Still show finished screen so they aren't stuck
      setMode('finished');
    } finally {
      setSubmitting(false);
    }
  };

  const content = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error || !quiz) {
      return (
        <div className="flex items-center justify-center h-full">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || "We couldn't find the learning module you're looking for."}</p>
            </CardContent>
            <CardFooter>
              <Link href="/quizzes">
                <Button>Back to Modules</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }

    if (mode === 'reading') {
      return (
         <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <BookOpen className="text-primary w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
                <p className="text-muted-foreground mt-1">Read the material below to prepare for the quiz.</p>
              </div>
            </div>
          </div>
          
          <Card className="mb-8 shadow-sm">
            <CardContent className="p-6 md:p-10">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none 
                           prose-headings:text-primary prose-headings:font-bold
                           prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                           prose-li:marker:text-primary/70"
                dangerouslySetInnerHTML={{ __html: quiz.learning_material || '' }}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center mb-12">
            <Button onClick={() => setMode('quiz')} size="lg" className="w-full sm:w-auto text-lg px-8 py-6 h-auto shadow-md">
              Start the Quiz Now
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </div>
      )
    }

    if (mode === 'finished') {
      return (
         <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Quiz Complete!</CardTitle>
              <CardDescription>You've completed "{quiz.title}".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-bold text-primary">{score} / {quiz.quiz_questions.length}</p>
              {pointsEarned > 0 ? (
                <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
                  +{pointsEarned} Eco Points Earned!
                </p>
              ) : (
                <p className="text-muted-foreground">Keep practicing to learn more!</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-center gap-4 flex-wrap">
              <Link href="/quizzes">
                <Button variant="outline">Back to Library</Button>
              </Link>
              <Link href="/leaderboard">
                <Button>View Leaderboard</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )
    }
    
    // Quiz Mode
    const currentQuestion = quiz.quiz_questions[currentQuestionIndex];
    
    if (!currentQuestion) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p className="text-lg">Could not load quiz questions for this module.</p>
           <Link href="/quizzes" className="mt-4">
              <Button>Back to Modules</Button>
            </Link>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>
              Question {currentQuestionIndex + 1} of {quiz.quiz_questions.length}
            </CardTitle>
            <CardDescription>
              {quiz.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-semibold">{currentQuestion.question_text}</p>
            <RadioGroup 
              value={selectedAnswerIndex !== null ? selectedAnswerIndex.toString() : ''} 
              onValueChange={(val) => setSelectedAnswerIndex(parseInt(val))}
              disabled={selectedAnswerIndex !== null || submitting}
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded-md border ${
                    selectedAnswerIndex !== null && index === currentQuestion.correct_index
                      ? 'border-green-500 bg-green-500/10 dark:bg-green-500/20'
                      : selectedAnswerIndex !== null && index === selectedAnswerIndex && index !== currentQuestion.correct_index
                      ? 'border-red-500 bg-red-500/10 dark:bg-red-500/20'
                      : 'hover:bg-accent'
                  }`}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            
            {/* Show explanation after they answer */}
            {selectedAnswerIndex !== null && currentQuestion.explanation && (
                <div className="mt-4 p-4 rounded-md bg-secondary text-sm">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                </div>
            )}
            
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNextQuestion} disabled={selectedAnswerIndex === null || submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {currentQuestionIndex < quiz.quiz_questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
              {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <Desktop>{content()}</Desktop>;
}
