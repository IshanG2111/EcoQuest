import Image from 'next/image';

export const QuizzesIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/quizzes.png"
    alt="Quizzes"
    width={40}
    height={40}
    className={className}
  />
);
