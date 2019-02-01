import {Pyramid} from "./pyramid";
import {Resize} from "./resize";

export class ImagePyramid implements Pyramid {

    constructor(
        private readonly _context: CanvasRenderingContext2D,
        private readonly _scale: number = 0.666,
        private readonly _minWidth: number = 28,
        private readonly _minHeight: number = 28
    ) {}

    pyramids(): ImageData[] {

        const originalImageData = this._context.getImageData(0, 0, this._context.canvas.width, this._context.canvas.height);
        const original: Resize = new Resize(originalImageData);
        const pyramidImageData: ImageData[] = [];
        pyramidImageData.push(originalImageData);
        let w = this._context.canvas.width;
        let h = this._context.canvas.height;

        // keep looping over the pyramid
        while (true) {
            // compute the new dimensions of the image and resize it
            const newWidth = Math.floor(w * this._scale);
            const newHeight = Math.floor(h * this._scale);

            const resized = original.resizeImageData(newWidth, newHeight);
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
