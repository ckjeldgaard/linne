import {Photo} from "./Photo";

export class ResizePhoto implements Photo {

    constructor(private readonly origin: Photo, private readonly newWidth: number, private readonly newHeight: number) {}

    async draw(): Promise<ImageData> {
        const imgData = await this.origin.draw();

        const canvas = document.createElement("canvas");
        canvas.width = imgData.width;
        canvas.height = imgData.height;
        const canvasContext = canvas.getContext("2d");

        return new Promise<ImageData>(async (resolve, reject) => {
            if (canvasContext != null) {
                canvasContext.putImageData(imgData, 0, 0, 0, 0, imgData.width, imgData.height);

                const resized = await this.resizeImage(canvas.toDataURL());
                return resolve(resized);
            } else {
                reject();
            }
        });
    }

    private resizeImage(dataUrl: string): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            const canvasCopy = document.createElement("canvas");
            canvasCopy.width = this.newWidth;
            canvasCopy.height = this.newHeight;
            const contextCopy = canvasCopy.getContext("2d");

            let img = new Image();
            img.onload = () => {
                if (contextCopy != null) {
                    contextCopy.drawImage(img, 0, 0, canvasCopy.width, canvasCopy.height);
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