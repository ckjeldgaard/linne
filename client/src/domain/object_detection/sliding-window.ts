export class SlidingWindow {

    constructor(
        private readonly image: ImageData,
        private readonly stepSize: number = 32,
        private readonly windowSize: number = 128) {}

    window(callback: (x: number, y: number, data: ImageData) => void): void {

        for (let y = 0; y <= (this.image.height - this.windowSize); y += this.stepSize) {
            for (let x = 0; x <= (this.image.width - this.windowSize); x += this.stepSize) {
                const imageData = this.cropWindow(x, y);
                callback(x, y, imageData);
            }
        }

    }

    private cropWindow(x: number, y: number): ImageData {
        const window = new ImageData(this.windowSize, this.windowSize);
        let pos = 0;
        for (let i = y; i < (y + this.windowSize); i++) {
            for (let j = x; j < (x + this.windowSize); j++) {
                window.data[pos++] = this.image.data[(i * this.image.width * 4) + (j * 4)];
                window.data[pos++] = this.image.data[(i * this.image.width * 4) + (j * 4) + 1];
                window.data[pos++] = this.image.data[(i * this.image.width * 4) + (j * 4) + 2];
                window.data[pos++] = this.image.data[(i * this.image.width * 4) + (j * 4) + 3];
            }
        }
        return window;
    }

}
