import Image from 'next/image';

export const OceanExplorerIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/ocean-explorer.png"
    alt="Ocean Explorer"
    width={40}
    height={40}
    className={className}
  />
);
