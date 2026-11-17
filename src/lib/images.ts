import type { ImageMetadata } from 'astro';

/**
 * Photos and work samples live at fixed paths and are referenced from YAML by their file name
 * without the extension, for example "headshot" or "email-1-preview". These maps make the typed
 * image modules available to pages, so Astro's <Image> can size and optimise them.
 */
const photoModules = import.meta.glob<ImageMetadata>('../assets/photos/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});
const sampleModules = import.meta.glob<ImageMetadata>('../assets/samples/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

function byKey(modules: Record<string, ImageMetadata>, folder: string): Record<string, ImageMetadata> {
  const map: Record<string, ImageMetadata> = {};
  for (const [path, image] of Object.entries(modules)) {
    const name = path.split('/').pop()?.replace(/\.[^.]+$/, '');
    if (name) map[name] = image;
  }
  if (Object.keys(map).length === 0) throw new Error(`No images found in ${folder}`);
  return map;
}

const photos = byKey(photoModules, 'src/assets/photos');
const samples = byKey(sampleModules, 'src/assets/samples');

/** A photo from src/assets/photos/ by name, without the extension. */
export function photo(name: string): ImageMetadata {
  const image = photos[name];
  if (!image) throw new Error(`No photo "${name}" in src/assets/photos/`);
  return image;
}

/** A sample image from src/assets/samples/ by name, without the extension. */
export function sample(name: string): ImageMetadata {
  const image = samples[name];
  if (!image) throw new Error(`No sample image "${name}" in src/assets/samples/`);
  return image;
}
