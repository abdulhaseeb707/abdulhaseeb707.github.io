import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { WorkGrid } from '@/components/WorkGrid';
import { Education } from '@/components/Education';
import { Papers } from '@/components/Papers';
import { Projects } from '@/components/Projects';
import { Places } from '@/components/Places';
import { Contact } from '@/components/Contact';
import { Viewer } from '@/components/Viewer';
import { JsonLd } from '@/components/JsonLd';
import { homeGraph } from '@/lib/structured-data';

export const metadata: Metadata = { alternates: { canonical: '/' } };

// Profile first, then what I've done, what I studied, my papers, my projects and where I've been.
export default function Home() {
  return (
    <>
      <JsonLd graph={homeGraph()} />
      <Hero />
      <WorkGrid />
      <Education />
      <Papers />
      <Projects />
      <Places />
      <Contact />
      <Viewer />
    </>
  );
}
