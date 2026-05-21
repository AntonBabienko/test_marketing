import './globals.css';

export const metadata = {
  title: 'LeadFlow — Розумна обробка заявок',
  description:
    'MVP платформа для автоматичної обробки, класифікації та маршрутизації лідів з AI-powered аналітикою',
  keywords: 'leads, marketing, automation, AI, CRM',
  openGraph: {
    title: 'LeadFlow — Розумна обробка заявок',
    description: 'Автоматична обробка лідів з AI-summary та класифікацією',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
