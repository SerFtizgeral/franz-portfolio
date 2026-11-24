import localFont from 'next/font/local';
import './styles.css';

const manrope = localFont({
  src: '../public/media/manrope.woff2',
  weight: '200 800',
  display: 'swap',
  variable: '--font-manrope',
});

const spaceGrotesk = localFont({
  src: '../public/media/space-grotesk.woff2',
  weight: '300 700',
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata = {
  title: 'Francis Jeeves Julayco — Developer & Designer',
  description: 'The portfolio of Francis Jeeves Julayco, featuring web development, game design, and concept art.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
