import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { Poppins, VT323, Press_Start_2P, IBM_Plex_Mono, Roboto_Condensed } from 'next/font/google';

export const metadata: Metadata = {
  title: 'EcoQuest',
  description: 'Learn about sustainability and compete with friends!',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-body',
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-headline',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
});

const robotoCondensed = Roboto_Condensed({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-roboto-condensed',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-body antialiased ${poppins.variable} ${vt323.variable} ${pressStart2P.variable} ${ibmPlexMono.variable} ${robotoCondensed.variable}`}>
        <AuthProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="the-tva-archives"
            enableSystem={false}
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
