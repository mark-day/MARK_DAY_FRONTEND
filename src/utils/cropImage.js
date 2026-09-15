import { createImage } from './loadImage';

export default async function getCroppedImg(imageSrc, cropAreaPixels) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = cropAreaPixels.width;
    canvas.height = cropAreaPixels.height;

    ctx.drawImage(
        image,
        cropAreaPixels.x,
        cropAreaPixels.y,
        cropAreaPixels.width,
        cropAreaPixels.height,
        0,
        0,
        cropAreaPixels.width,
        cropAreaPixels.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('Canvas is empty or crop area invalid');
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                resolve(reader.result);
            };
        }, 'image/jpeg');
    });
}