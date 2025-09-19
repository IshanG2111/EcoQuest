import Image from 'next/image';

export const DailyBriefingIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/daily-briefing.png"
    alt="Daily Briefing"
    width={40}
    height={40}
    className={className}
  />
);
