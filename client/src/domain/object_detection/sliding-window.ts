export class SlidingWindow {

    constructor(
        private readonly context: CanvasRenderingContext2D,
        private readonly stepSize: number = 32,
        private readonly windowSize: number = 128) {}

    window(callback: (x: number, y: number, data: ImageData) => void) {
        for (let y = 0; y < (this.context.canvas.height - this.windowSize); y += this.stepSize) {
            for (let x = 0; x < (this.context.canvas.width - this.windowSize); x += this.stepSize) {
                const imageData = this.context.getImageData(x, y, this.windowSize, this.windowSize);
                callback(x, y, imageData);
            }
        }
    }

}
