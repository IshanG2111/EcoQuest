import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quizModules } from '@/lib/quizzes-data';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Desktop } from '@/components/desktop';

export default function QuizzesPage() {
  return (
    <Desktop>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge on a variety of eco-topics.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizModules.map((module) => (
            <Card
              key={module.id}
              id={module.id}
              className="flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <module.icon className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="mb-2">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {module.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/learn/quiz/${module.id}`} className="w-full">
                  <Button className="w-full">
                    <FileQuestion className="mr-2 h-4 w-4" />
                    Start Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Desktop>
  );
}
