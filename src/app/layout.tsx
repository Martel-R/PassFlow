
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from "@/components/ui/toaster"
import { getSettings } from '@/lib/db';
import { CSSProperties } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings(['organizationName']);
  const organizationName = settings.organizationName || 'Sistema de Atendimento';
 
  return {
    title: {
      default: organizationName,
      template: `%s | ${organizationName}`,
    },
    description: 'Sistema de gestão de senhas e atendimento.',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings([
    'organizationName',
    'theme.primary',
    'theme.accent',
    'theme.background',
  ]);

  const organizationName = settings.organizationName;

  const themeStyle: CSSProperties = {
    '--primary': settings['theme.primary'] || '210 70% 50%',
    '--accent': settings['theme.accent'] || '180 60% 40%',
    '--background': settings['theme.background'] || '210 20% 95%',
  } as CSSProperties;

  return (
    <html lang="en" suppressHydrationWarning style={themeStyle}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppShell organizationName={organizationName}>
          {children}
        </AppShell>
        <Toaster />
      </body>
    </html>
  );
}
