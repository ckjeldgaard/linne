export class Plot {

    constructor(private readonly imageData: number[][], private readonly canvasSize: number) {}

    async toCanvasImageData(): Promise<ImageData> {
        const canvas = document.createElement("canvas");
        canvas.width = this.canvasSize;
        canvas.height = this.canvasSize;

        const ctx = canvas.getContext("2d");
        return new Promise<ImageData>(async (resolve, reject) => {
            if (ctx != null) {
                const imageData = ctx.createImageData(this.canvasSize, this.canvasSize);
                this.plotImage(imageData);
                return resolve(imageData);
            } else {
                reject();
            }
        });
    }

    private plotImage(imageData: ImageData): void {
        const cellSize = Math.floor(this.canvasSize / this.imageData.length);
        for (let i = 0; i < this.imageData.length; i ++) {
            for (let j = 0; j < this.imageData[i].length; j ++) {
                const color = (1 - this.imageData[i][j]) * 255;

                for (let x = j * cellSize; x < j * cellSize + cellSize; x++) {
                    for (let y = i * cellSize; y < i * cellSize + cellSize; y++) {
                        Plot.setPixel(imageData, x, y, color, color, color, 255);
                    }
                }
            }
        }
    }

    private static setPixel(imageData: ImageData, x: number, y: number, r: number, g: number, b: number, a: number): void {
        const index = (x + y * imageData.width);
        imageData.data[index * 4] = r;
        imageData.data[index * 4 + 1] = g;
        imageData.data[index * 4 + 2] = b;
        imageData.data[index * 4 + 3] = a;
    }

}