'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GameBriefingShellProps {
  phase: 'home' | 'rules';
  title: string;
  subtitle: string;
  videoSrc: string;
  rulesTitle: string;
  rules: string[];
  openLabel: string;
  startLabel: string;
  onOpenRules: () => void;
  onStart: () => void;
}

export function GameBriefingShell({
  phase,
  title,
  subtitle,
  videoSrc,
  rulesTitle,
  rules,
  openLabel,
  startLabel,
  onOpenRules,
  onStart,
}: GameBriefingShellProps) {
  if (phase === 'home') {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-950 px-6 py-10 text-center text-white">
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,122,61,0.14),transparent_42%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.2))]" />

        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/90 md:text-xs">Play &gt; Mission Brief</p>
          <h1 className="font-headline text-5xl uppercase tracking-[0.08em] text-primary drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] md:text-7xl">
            {title}
          </h1>
          <p className="max-w-2xl text-balance text-lg text-white/90 md:text-xl">{subtitle}</p>
          <Button
            onClick={onOpenRules}
            size="lg"
            className="mt-4 min-w-56 bg-primary px-8 py-6 text-base font-headline uppercase tracking-[0.18em] text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 md:text-lg"
          >
            {openLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-950 via-background to-slate-900/80 px-5 py-10 text-white">
      <Card className="w-full max-w-3xl border-primary/30 bg-card/95 shadow-2xl shadow-black/30">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="font-headline text-3xl uppercase tracking-[0.14em] text-primary md:text-4xl">
            {rulesTitle}
          </CardTitle>
          <CardDescription className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            {subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left text-sm text-muted-foreground md:text-base">
          {rules.map((rule, index) => (
            <p key={rule} className="leading-relaxed">
              <span className="font-bold text-primary">{index + 1}. </span>
              {rule}
            </p>
          ))}
          <div className="pt-2">
            <Button onClick={onStart} className="h-12 w-full font-headline uppercase tracking-[0.16em] md:h-14">
              {startLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}