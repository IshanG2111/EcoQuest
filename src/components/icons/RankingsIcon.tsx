import Image from 'next/image';

export const RankingsIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/rankings.png"
    alt="Rankings"
    width={40}
    height={40}
    className={className}
  />
);
