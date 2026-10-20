// The CV download. Static export (the live site): rendered once at build into out/Abdul-Haseeb-Khan-CV.pdf.
// Standalone server (Oracle Cloud): the same handler renders it from content/profile.yaml.
import { createElement } from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { CvDocument } from '@/lib/cv/CvDocument';

export const dynamic = 'force-static';

export async function GET() {
  const pdf = await renderToBuffer(createElement(CvDocument) as ReactElement<DocumentProps>);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="Abdul-Haseeb-Khan-CV.pdf"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
