import {Photo} from "./Photo";

export class CroppedPhoto implements Photo {

    constructor(private readonly imageFileBlob: Blob, private readonly imageWidth: number, private readonly imageHeight: number) {}

    private loadImage(canvasContext: CanvasRenderingContext2D | null, blob: Blob): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                if (canvasContext != null) {
                    canvasContext.drawImage(img, 0, 0);
                    let imageData: ImageData = canvasContext.getImageData(0, 0, img.width, img.height);
                    resolve(imageData);
                } else {
                    reject();
                }
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
    }

    async draw(): Promise<ImageData> {
        const canvas = document.createElement("canvas");
        canvas.width = this.imageWidth;
        canvas.height = this.imageHeight;
        const canvasContext = canvas.getContext("2d");
        return await this.loadImage(canvasContext, this.imageFileBlob);
    }
}