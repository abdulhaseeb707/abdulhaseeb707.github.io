// A responsive image from the WebP variants made by scripts/optimize-images.mjs.
import { img } from '@/lib/images';

type Props = {
  src: string; // path inside assets/, e.g. "photos/portrait.jpg"
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function Photo({ src, alt, sizes, className, priority = false }: Props) {
  const i = img(src);
  return (
    <img
      src={i.src}
      srcSet={i.srcSet}
      sizes={sizes}
      width={i.width}
      height={i.height}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
    />
  );
}
