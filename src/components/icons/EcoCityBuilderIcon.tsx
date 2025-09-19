import Image from 'next/image';

export const EcoCityBuilderIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/eco-city-builder.png"
    alt="Eco City Builder"
    width={40}
    height={40}
    className={className}
  />
);
