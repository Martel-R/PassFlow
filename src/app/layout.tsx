
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from "@/components/ui/toaster"
import { getSetting } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const organizationName = await getSetting('organizationName') || 'Sistema de Atendimento';
 
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
  const organizationName = await getSetting('organizationName');

  return (
    <html lang="en" suppressHydrationWarning>
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
