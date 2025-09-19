import Image from 'next/image';

export const RecycleRallyIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/recycle-rally.png"
    alt="Recycle Rally"
    width={40}
    height={40}
    className={className}
  />
);
