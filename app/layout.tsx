import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const metadata: Metadata = {
  title: 'Idle MMO RPG',
  description: 'An idle RPG adventure built with Bun, Next.js, and MongoDB.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="min-h-screen bg-starfield">
        <div className="min-h-screen bg-slate-950/80">
          {children}
        </div>
      </body>
    </html>
  );
}
