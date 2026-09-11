/**
 * Client-side media helpers: extract video frame + compress images to small JPEG.
 */

/** Compress an image File/Blob to a small JPEG (target ~30–80 KB). */
export async function compressImage(
  source: File | Blob | HTMLImageElement | HTMLCanvasElement,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<Blob> {
  const maxWidth = options.maxWidth ?? 480;
  const maxHeight = options.maxHeight ?? 854;
  const quality = options.quality ?? 0.72;

  let bitmap: ImageBitmap | HTMLImageElement | HTMLCanvasElement;

  if (source instanceof HTMLCanvasElement) {
    bitmap = source;
  } else if (source instanceof HTMLImageElement) {
    bitmap = source;
  } else {
    bitmap = await createImageBitmap(source);
  }

  const w =
    "naturalWidth" in bitmap
      ? bitmap.naturalWidth || bitmap.width
      : bitmap.width;
  const h =
    "naturalHeight" in bitmap
      ? bitmap.naturalHeight || bitmap.height
      : bitmap.height;

  let tw = w;
  let th = h;
  if (tw > maxWidth) {
    th = Math.round((th * maxWidth) / tw);
    tw = maxWidth;
  }
  if (th > maxHeight) {
    tw = Math.round((tw * maxHeight) / th);
    th = maxHeight;
  }

  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, tw, th);

  if ("close" in bitmap && typeof bitmap.close === "function") {
    bitmap.close();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to compress image"));
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Grab a frame from a video file (~1s in, or middle of short clips)
 * and return a compressed JPEG blob suitable for thumbnails.
 */
export async function extractVideoThumbnail(
  videoFile: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<{ blob: Blob; previewUrl: string }> {
  const url = URL.createObjectURL(videoFile);

  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () =>
        reject(new Error("Could not load video for thumbnail"));
      video.load();
    });

    const duration = video.duration || 1;
    const seekTo = Math.min(1, Math.max(0.1, duration * 0.1));

    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      video.addEventListener("seeked", onSeeked);
      video.currentTime = seekTo;
      setTimeout(() => resolve(), 1500);
    });

    const canvas = document.createElement("canvas");
    const w = video.videoWidth || 720;
    const h = video.videoHeight || 1280;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.drawImage(video, 0, 0, w, h);

    video.src = "";
    video.load();

    const blob = await compressImage(canvas, {
      maxWidth: options.maxWidth ?? 480,
      maxHeight: options.maxHeight ?? 854,
      quality: options.quality ?? 0.7,
    });

    const previewUrl = URL.createObjectURL(blob);
    return { blob, previewUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Turn a user-picked image into a small JPEG File for upload. */
export async function compressThumbnailFile(file: File): Promise<File> {
  const blob = await compressImage(file, {
    maxWidth: 480,
    maxHeight: 854,
    quality: 0.7,
  });
  return new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
}

/** Approximate size label for UI */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}