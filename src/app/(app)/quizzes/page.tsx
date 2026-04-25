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
          <h1 className="text-3xl font-headline tracking-tight uppercase">Knowledge Library</h1>
          <p className="text-muted-foreground font-body">
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
                className="flex flex-col overflow-hidden retro-window hover:shadow-2xl transition-all duration-300"
              >
                <CardHeader className="bg-secondary/10 border-b border-border/10">
                  <div className="flex items-start gap-4">
                    <BookOpen className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <CardTitle className="mb-2 font-headline text-sm tracking-widest uppercase">{quiz.title}</CardTitle>
                      <CardDescription className="font-body text-xs">{quiz.description || `Learn about ${quiz.topic}`}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-headline text-[9px] tracking-widest uppercase">{quiz.topic}</Badge>
                    <Badge variant="outline" className="font-headline text-[9px] tracking-widest uppercase">{quiz.difficulty}</Badge>
                    <Badge className="bg-primary text-primary-foreground font-headline text-[9px] tracking-widest uppercase">
                      {quiz.points_value} PTS
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/10 border-t border-border/10">
                  <Link href={`/learn/quiz/${quiz._id.toString()}`} className="w-full">
                    <Button className="w-full font-headline text-xs tracking-widest h-10">
                      <FileQuestion className="mr-2 h-4 w-4" />
                      READ_AND_PRACTICE
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
