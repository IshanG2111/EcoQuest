import Image from 'next/image';

export const CarbonQuestIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/carbon-quest.png"
    alt="Carbon Quest"
    width={40}
    height={40}
    className={className}
  />
);
