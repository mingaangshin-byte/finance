import './globals.css';

export const metadata = {
  title: 'Questions People Often Ask',
  description: 'Advisor FAQ Archive',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}