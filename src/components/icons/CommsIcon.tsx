import Image from 'next/image';

export const CommsIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/comms.png"
    alt="Comms"
    width={40}
    height={40}
    className={className}
  />
);
