'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { quizModules } from '@/lib/quizzes-data';
import { quizzes } from '@/lib/quizzes';
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
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Desktop } from '@/components/desktop';

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function QuizPage() {
  const params = useParams();
  const id = params.id as string;
  const module = quizModules.find((m) => m.id === id);
  const quizData = module;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (quizData) {
      setQuestions(quizData.questions);
    }
  }, [quizData]);

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  }

  const content = () => {
    if (!module) {
      return (
        <div className="flex items-center justify-center h-full">
          <Card>
            <CardHeader>
              <CardTitle>Module not found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We couldn't find the learning module you're looking for.</p>
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

    if (quizFinished) {
      return (
         <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Quiz Complete!</CardTitle>
              <CardDescription>You've completed the quiz for "{module.title}".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-bold">Your Score: {score} / {questions.length}</p>
              <p>Great job expanding your eco-knowledge!</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/quizzes">
                <Button>Choose Another Module</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p className="text-lg">Could not load quiz questions for this module.</p>
          <p>Please go back and try again.</p>
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
              Quiz: {module.title}
            </CardTitle>
            <CardDescription>
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-semibold">{currentQuestion?.question}</p>
            <RadioGroup 
              value={selectedAnswer ?? ''} 
              onValueChange={handleAnswerSelect}
              disabled={!!selectedAnswer}
            >
              {currentQuestion?.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded-md border ${
                    selectedAnswer && option === currentQuestion.correctAnswer
                      ? 'quiz-correct'
                      : selectedAnswer && option === selectedAnswer && option !== currentQuestion.correctAnswer
                      ? 'quiz-incorrect'
                      : ''
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNextQuestion} disabled={!selectedAnswer}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <Desktop>{content()}</Desktop>;
}
