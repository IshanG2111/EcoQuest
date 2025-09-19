import Image from 'next/image';

export const ForestGuardianIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/forest-guardian.png"
    alt="Forest Guardian"
    width={40}
    height={40}
    className={className}
  />
);
