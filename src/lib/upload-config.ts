/**
 * Upload limits for album images. Uses NEXT_PUBLIC_* so the same values
 * are available on client (hint + cap) and server (API enforcement).
 */
const defaultMaxFiles = 20;
const defaultMaxFileSizeMB = 4;

const maxFilesRaw =
  process.env.NEXT_PUBLIC_ALBUM_MAX_FILES_PER_UPLOAD ??
  process.env.ALBUM_MAX_FILES_PER_UPLOAD;
const maxFileSizeMBRaw =
  process.env.NEXT_PUBLIC_ALBUM_MAX_FILE_SIZE_MB ??
  process.env.ALBUM_MAX_FILE_SIZE_MB;

export const maxFilesPerUpload = Math.max(
  1,
  Math.min(100, parseInt(String(maxFilesRaw), 10) || defaultMaxFiles)
);
const maxFileSizeMB = Math.max(
  0.5,
  Math.min(50, parseFloat(String(maxFileSizeMBRaw)) || defaultMaxFileSizeMB)
);
export const maxFileSizeBytes = Math.floor(maxFileSizeMB * 1024 * 1024);
export const maxFileSizeMBDisplay = maxFileSizeMB;
