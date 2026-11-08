const MAX_SIDE = 1280;
const JPEG_QUALITY = 0.8;

function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => (image.naturalWidth ? resolve(image) : reject(new Error("Image has no size")));
    image.onerror = () => reject(new Error("Image could not be decoded"));
    image.src = url;
  }).finally(() => URL.revokeObjectURL(url));
}

function hasTransparency(context: CanvasRenderingContext2D, width: number, height: number) {
  const { data } = context.getImageData(0, 0, width, height);
  for (let alpha = 3; alpha < data.length; alpha += 4) {
    if (data[alpha] < 255) return true;
  }
  return false;
}

/** Fits an image within 1280px and returns it as a JPEG data URL, or PNG if it has transparency. */
export async function compressImage(file: File): Promise<string> {
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0, width, height);

  if (file.type === "image/png" && hasTransparency(context, width, height)) {
    return canvas.toDataURL("image/png");
  }

  // JPEG has no alpha channel, so any transparency in other formats goes on white instead of black.
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export const dataUrlBytes = (dataUrl: string) => Math.ceil(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);
