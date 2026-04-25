import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FileQuestion, BookOpen } from 'lucide-react';
import { Desktop } from '@/components/desktop';
import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export const dynamic = 'force-dynamic';

export default async function QuizzesPage() {
  await connectDB();
  
  // Fetch published quizzes from database
  const quizzes = await Quiz.find({ is_published: true })
    .select('_id title topic description difficulty points_value')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <Desktop>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Library</h1>
          <p className="text-muted-foreground">
            Read articles and test your knowledge to earn points!
          </p>
        </div>

        {quizzes.length === 0 ? (
          <p className="text-muted-foreground">No content available at the moment. Check back later!</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz: any) => (
              <Card
                key={quiz._id.toString()}
                className="flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <BookOpen className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <CardTitle className="mb-2">{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description || `Learn about ${quiz.topic}`}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{quiz.topic}</Badge>
                    <Badge variant="outline">{quiz.difficulty}</Badge>
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                      {quiz.points_value} pts
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/learn/quiz/${quiz._id.toString()}`} className="w-full">
                    <Button className="w-full">
                      <FileQuestion className="mr-2 h-4 w-4" />
                      Read & Practice
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Desktop>
  );
}
