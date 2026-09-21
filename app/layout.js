import './globals.css';

export const metadata = {
  title: 'لوحة الفوركس',
  description: 'أسعار ومؤشرات فوركس لحظية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
