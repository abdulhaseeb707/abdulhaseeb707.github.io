import { Hero } from '@/components/Hero';
import { ResearchTeaser } from '@/components/ResearchTeaser';
import { WorkGrid } from '@/components/WorkGrid';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Viewer } from '@/components/Viewer';

export default function Home() {
  return (
    <>
      <Hero />
      <ResearchTeaser />
      <WorkGrid />
      <About />
      <Contact />
      <Viewer />
    </>
  );
}
