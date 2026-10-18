import { Hero } from '@/components/Hero';
import { WorkGrid } from '@/components/WorkGrid';
import { Education } from '@/components/Education';
import { Papers } from '@/components/Papers';
import { Places } from '@/components/Places';
import { Contact } from '@/components/Contact';
import { Viewer } from '@/components/Viewer';

// Profile first, then what I've done, what I studied, my papers and where I've been.
export default function Home() {
  return (
    <>
      <Hero />
      <WorkGrid />
      <Education />
      <Papers />
      <Places />
      <Contact />
      <Viewer />
    </>
  );
}
