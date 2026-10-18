import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Geist, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/Reveal';
import { profile, site } from '@/lib/profile';
import { img } from '@/lib/images';
import { withBase } from '@/lib/base';
import './globals.css';

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' });
const sans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

const { person, contact, research } = profile;
const description = `${person.sub} ${research.tagline}`;
const portrait = img(person.portrait);

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${person.name} · Economist, ${person.location}`, template: `%s · ${person.name}` },
  description,
  authors: [{ name: person.name, url: site.url }],
  icons: { icon: withBase('/favicon.svg') },
  openGraph: {
    type: 'profile',
    title: `${person.name} · Economist`,
    description,
    url: site.url,
    images: [{ url: portrait.src, width: portrait.width, height: portrait.height, alt: person.name }],
  },
  twitter: { card: 'summary' },
};

export const viewport: Viewport = { themeColor: '#f4f1ea', colorScheme: 'light' };

const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: person.name,
  url: site.url,
  jobTitle: 'Economist',
  homeLocation: { '@type': 'Place', name: person.location },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of the Punjab' },
  sameAs: [contact.linkedin, contact.github],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
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
