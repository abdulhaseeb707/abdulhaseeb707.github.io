import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Geist, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/Reveal';
import { JsonLd } from '@/components/JsonLd';
import { profile, site } from '@/lib/profile';
import { shareImage } from '@/lib/meta';
import { siteGraph } from '@/lib/structured-data';
import { withBase } from '@/lib/base';
import './globals.css';

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' });
const sans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

const { person, seo } = profile;
const homeImage = shareImage('home', `${person.name}, ${person.label}`);

// the home page's title, description and share card; inner pages replace them (lib/meta.ts)
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: seo.home.title, template: `%s · ${person.name}` },
  description: seo.home.description,
  authors: [{ name: person.name, url: site.url }],
  icons: {
    icon: [
      { url: withBase('/favicon.svg'), type: 'image/svg+xml' },
      { url: withBase('/icons/icon-96.png'), sizes: '96x96', type: 'image/png' },
    ],
    apple: withBase('/icons/apple-touch-icon.png'),
  },
  openGraph: { type: 'profile', title: seo.home.title, description: seo.home.description, url: '/', images: [homeImage] },
  twitter: { card: 'summary_large_image', title: seo.home.title, description: seo.home.description, images: [homeImage] },
};

export const viewport: Viewport = { themeColor: '#f4f1ea', colorScheme: 'light' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <JsonLd graph={siteGraph()} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Reveal />
      </body>
    </html>
  );
}
