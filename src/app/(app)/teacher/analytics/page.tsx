'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { studentPerformance, chartData } from '@/lib/data';

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        <p className="text-muted-foreground">
          Review student activity and engagement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Average Score Over Time</CardTitle>
            <CardDescription>Monthly average quiz scores for the class.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <Tooltip
                    contentStyle={{
                        background: `hsl(var(--card))`,
                        borderColor: `hsl(var(--border))`
                    }}
                />
                <Legend />
                <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
            <CardDescription>An overview of individual student progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Quizzes</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead>Modules</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentPerformance.map((student) => (
                  <TableRow key={student.student}>
                    <TableCell className="font-medium">{student.student}</TableCell>
                    <TableCell>{student.quizzes}</TableCell>
                    <TableCell>{student.avgScore}%</TableCell>
                    <TableCell>{student.modules}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
