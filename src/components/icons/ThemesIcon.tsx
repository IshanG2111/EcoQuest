import Image from 'next/image';

export const ThemesIcon = ({ className }: { className?: string }) => (
  <Image
    src="/pixel-icons/themes.png"
    alt="Themes"
    width={40}
    height={40}
    className={className}
  />
);
