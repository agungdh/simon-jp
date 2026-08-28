import ThemeRegistry from './ThemeRegistry';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SIMON JP',
  description: 'Frontend Next.js + MUI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
