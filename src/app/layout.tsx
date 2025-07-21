
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from "@/components/ui/toaster"
import { getSettings } from '@/lib/db';
import { CSSProperties } from 'react';
import { StoreInitializer } from '@/components/layout/store-initializer';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import type { Session } from '@/lib/store';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
    'organizationLogo',
    'theme.primary',
    'theme.accent',
    'theme.background',
  ]);

  const organizationName = settings.organizationName;
  const organizationLogo = settings.organizationLogo;

  const themeStyle: CSSProperties = {
    '--primary': settings['theme.primary'] || '210 70% 50%',
    '--accent': settings['theme.accent'] || '180 60% 40%',
    '--background': settings['theme.background'] || '210 20% 95%',
  } as CSSProperties;

  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('auth-session');
  let initialSession: Session | null = null;
  if (sessionCookie) {
    try {
      initialSession = JSON.parse(sessionCookie.value);
    } catch (e) {
      console.error("Failed to parse session cookie in layout", e);
      // Invalidate cookie if parsing fails
      cookieStore.delete('auth-session');
    }
  }

  return (
    <html lang="en" suppressHydrationWarning style={themeStyle} className={inter.variable}>
      <head />
      <body className="font-body antialiased">
        <StoreInitializer 
          organizationName={organizationName} 
          organizationLogo={organizationLogo}
          initialSession={initialSession}
        />
        <AppShell>
          {children}
        </AppShell>
        <Toaster />
      </body>
    </html>
  );
}
