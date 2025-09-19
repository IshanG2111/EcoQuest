import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, MessageSquare, ArrowRight } from 'lucide-react';

const teacherTools = [
  {
    title: 'Review Student Analytics',
    description: 'Track class progress and individual student performance on quizzes and modules.',
    icon: BarChart,
    href: '/teacher/analytics',
    cta: 'View Analytics',
  },
];

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome, Educator!</h2>
        <p className="text-muted-foreground">
          Here are your tools to inspire the next generation of eco-champions.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teacherTools.map((tool) => (
          <Card key={tool.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start gap-4">
                 <div className="p-3 bg-secondary rounded-md">
                    <tool.icon className="h-6 w-6 text-secondary-foreground" />
                 </div>
                <div>
                    <CardTitle>{tool.title}</CardTitle>
                    <CardDescription className="mt-2">{tool.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1" />
            <div className="p-6 pt-0">
              <Link href={tool.href}>
                <Button className="w-full">
                  {tool.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
