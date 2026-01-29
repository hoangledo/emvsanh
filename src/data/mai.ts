export type MaiPhoto = {
  src: string;
  alt: string;
};

const PNG_INDICES = new Set([3, 6, 16, 19, 34]);

export const maiPhotos: MaiPhoto[] = Array.from({ length: 77 }, (_, i) => {
  const n = i + 1;
  const ext = PNG_INDICES.has(n) ? "png" : "jpg";
  return {
    src: `/mai/mai_${n}.${ext}`,
    alt: `Mai ${n}`,
  };
});
