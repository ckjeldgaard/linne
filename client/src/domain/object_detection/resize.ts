export class Resize {

    constructor(private readonly _imageSrc: ImageData) {}

    public resizeImageData(width: number, height: number): ImageData {

        const result = new ImageData(width, height);

        this.bilinearInterpolation(result);
        return result;
    }

    private bilinearInterpolation(dst: ImageData): void {
        let pos = 0;

        for (let y = 0; y < dst.height; y++) {
            for (let x = 0; x < dst.width; x++) {
                const srcX = x * this._imageSrc.width / dst.width;
                const srcY = y * this._imageSrc.height / dst.height;

                const xMin = Math.floor(srcX);
                const yMin = Math.floor(srcY);

                const xMax = Math.min(Math.ceil(srcX), this._imageSrc.width - 1);
                const yMax = Math.min(Math.ceil(srcY), this._imageSrc.height - 1);

                dst.data[pos++] = this.interpolateVertical(0, srcX, xMin, xMax, srcY, yMin, yMax); // R
                dst.data[pos++] = this.interpolateVertical(1, srcX, xMin, xMax, srcY, yMin, yMax); // G
                dst.data[pos++] = this.interpolateVertical(2, srcX, xMin, xMax, srcY, yMin, yMax); // B
                dst.data[pos++] = this.interpolateVertical(3, srcX, xMin, xMax, srcY, yMin, yMax); // A
            }
        }
    }

    private interpolateVertical(offset: number, x: number, xMin: number, xMax: number, y: number, yMin: number, yMax: number): number {
        const vMin = this.interpolateHorizontal(offset, x, yMin, xMin, xMax);
        if (yMin === yMax) {
            return vMin;
        }

        const vMax = this.interpolateHorizontal(offset, x, yMax, xMin, xMax);
        return this.interpolate(y, yMin, yMax, vMin, vMax);
    }

    private interpolateHorizontal(offset: number, x: number, y: number, xMin: number, xMax: number): number {
        const vMin = this._imageSrc.data[((y * this._imageSrc.width + xMin) * 4) + offset];
        if (xMin === xMax) {
            return vMin;
        }

        const vMax = this._imageSrc.data[((y * this._imageSrc.width + xMax) * 4) + offset];
        return this.interpolate(x, xMin, xMax, vMin, vMax);
    }

    private interpolate(k: number, kMin: number, kMax: number, vMin: number, vMax: number): number {
        return Math.round((k - kMin) * vMax + (kMax - k) * vMin);
    }
}

