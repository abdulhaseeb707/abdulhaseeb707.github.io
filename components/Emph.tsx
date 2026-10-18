import { emphasis } from '@/lib/moon';

/** Renders "text with *emphasis*" from profile.yaml: the starred part in italic green. */
export function Emph({ text }: { text: string }) {
  return (
    <>
      {emphasis(text).map((part, i) => (part.em ? <em key={i}>{part.text}</em> : <span key={i}>{part.text}</span>))}
    </>
  );
}
