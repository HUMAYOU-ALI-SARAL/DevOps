// utils/cropImage.ts
export const getCroppedImg = async (
  imageSrc: string,
  croppedAreaPixels: any,
  fileName: string = "cropped-image.png"
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx?.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], fileName, { type: blob.type });
      resolve(file);
    }, "image/png");
  });
};

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.setAttribute("crossOrigin", "anonymous"); // Prevent cross-origin issues
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
  });
