import './globals.css';
import { Inter } from 'next/font/google';
import { ToastProvider } from '../components/ui/ToastContainer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mccarren Tournament App',
  description: 'Tournament management for tennis clubs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}