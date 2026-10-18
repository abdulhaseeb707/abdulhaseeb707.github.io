'use client';
import { useState } from 'react';
import { Icon } from './Icon';

export function CopyButton({ text }: { text: string }) {
  const [label, setLabel] = useState('Copy');
  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setLabel('Copied');
        } catch {
          setLabel('Press Ctrl+C');
        }
        setTimeout(() => setLabel('Copy'), 2200);
      }}
    >
      <Icon name="copy" /> <span aria-live="polite">{label}</span>
    </button>
  );
}
