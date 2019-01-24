import {Pyramid} from "./pyramid";

export class ImagePyramid implements Pyramid {

    private readonly copyCanvas: HTMLCanvasElement;
    private readonly copyCtx: CanvasRenderingContext2D;

    constructor(
        private readonly _context: CanvasRenderingContext2D,
        private readonly _scale: number = 0.666,
        private readonly _minWidth: number = 28,
        private readonly _minHeight: number = 28
    ) {
        this.copyCanvas = document.createElement("canvas");
        this.copyCanvas.width = this._context.canvas.width;
        this.copyCanvas.height = this._context.canvas.height;
        this.copyCtx = this.copyCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.copyCtx.putImageData(this._context.getImageData(0, 0, this.copyCanvas.width, this.copyCanvas.height), 0, 0);
    }

    pyramids(): ImageData[] {
        const pyramidImageData: ImageData[] = [];

        let w = this._context.canvas.width;
        let h = this._context.canvas.height;

        // keep looping over the pyramid
        while (true) {
            // compute the new dimensions of the image and resize it
            const newWidth = Math.floor(w * this._scale);
            const newHeight = Math.floor(h * this._scale);
            
            this.copyCtx.scale(this._scale, this._scale);
            this.copyCtx.drawImage(this.copyCanvas, 0, 0, newWidth, newHeight);

            let resized: ImageData = this.copyCtx.getImageData(0, 0, newWidth, newHeight);
            w = newWidth;
            h = newHeight;

            // if the resized image does not meet the supplied minimum size, then stop constructing the pyramid
            if (resized.width < this._minHeight || resized.width < this._minWidth) {
                break;
            }

            pyramidImageData.push(resized);
        }

        return pyramidImageData;
    }
}
