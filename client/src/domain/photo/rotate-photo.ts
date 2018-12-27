import {Photo} from "./";

export class RotatePhoto implements Photo {

    constructor(private readonly origin: Photo, private readonly degrees: number) {}

    async draw(): Promise<ImageData> {
        const imgData = await this.origin.draw();

        const canvas = document.createElement("canvas");
        canvas.width = imgData.width;
        canvas.height = imgData.height;
        const canvasContext = canvas.getContext("2d");

        return new Promise<ImageData>(async (resolve, reject) => {
            if (canvasContext != null) {
                canvasContext.putImageData(imgData, 0, 0, 0, 0, imgData.width, imgData.height);

                const rotated = await this.rotateImage(canvas.toDataURL(), imgData.width, imgData.height);
                return resolve(rotated);
            } else {
                reject();
            }
        });
    }

    private rotateImage(dataUrl: string, width: number, height: number): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            const canvasCopy = document.createElement("canvas");
            canvasCopy.width = width;
            canvasCopy.height = height;
            const contextCopy = canvasCopy.getContext("2d");

            let img = new Image();
            img.onload = () => {
                if (contextCopy != null) {
                    contextCopy.translate(canvasCopy.width / 2, canvasCopy.height / 2);
                    contextCopy.rotate(this.degrees * Math.PI / 180);
                    contextCopy.drawImage(img, -img.width / 2, -img.width / 2);
                    let imageData: ImageData = contextCopy.getImageData(0, 0, canvasCopy.width, canvasCopy.height);
                    resolve(imageData);
                } else {
                    reject();
                }
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

}