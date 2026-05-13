export async function compressImage(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0–1
    mimeType?: "image/jpeg" | "image/webp";
  }
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
    mimeType = "image/webp",
  } = options || {};

  const imageBitmap = await createImageBitmap(file);

  let { width, height } = imageBitmap;

  const scale = Math.min(
    maxWidth / width,
    maxHeight / height,
    1 // never upscale
  );

  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject("Compression failed")),
      mimeType,
      quality
    )
  );

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: mimeType,
  });
}