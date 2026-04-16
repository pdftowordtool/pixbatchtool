import imageCompression from 'browser-image-compression';

export interface OptimizeOptions {
  quality: number;
  targetFormat: 'webp' | 'avif' | 'jpeg' | 'png';
  stripMetadata?: boolean;
}

export async function optimizeImage(
  file: File,
  options: OptimizeOptions
): Promise<{ blob: Blob; size: number }> {
  const qualityDecimal = options.quality / 100;

  const compressionOptions = {
    maxSizeMB: 10,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    fileType: `image/${options.targetFormat}` as any,
    initialQuality: qualityDecimal,
    preserveExif: !options.stripMetadata,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);

    const blob = new Blob([compressedFile], {
      type: `image/${options.targetFormat}`,
    });

    return {
      blob,
      size: blob.size,
    };
  } catch (error) {
    throw new Error(`Failed to optimize image: ${error}`);
  }
}
