import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SessionProvider } from '@/context/SessionContext';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Yomu - Belajar Literasi Informasi',
  description: 'Aplikasi pembelajaran literasi informasi dengan sistem gamifikasi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50">
        <SessionProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
