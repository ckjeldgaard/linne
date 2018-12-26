export class ClassifiedCoin {

    constructor(private readonly originalRef: string,
    private readonly originalRefUrl: string,
    private readonly coinLabel: number,
    private readonly coinSide: number,
    private readonly degrees: number,
    private readonly imageData: ImageData) {}

    public toObject(): object {
        return {
            originalRef: this.originalRef,
            originalRefUrl: this.originalRefUrl,
            coinLabel: this.coinLabel,
            coinSide: this.coinSide,
            degrees: this.degrees,
            image: this.toImageMatrix()
        };
    }

    private toImageMatrix(): number[][] {
        let matrix: number[][] = [];
        for (let y = 0; y < this.imageData.height; y++) {
            matrix[y] = [];
            for (let x = 0; x < this.imageData.width; x++) {
                let i = (y * 4) * this.imageData.width + x * 4;
                matrix[y][x] = Math.round((this.imageData.data[i] + this.imageData.data[i + 1] + this.imageData.data[i + 2]) / 3);
            }
        }
        return matrix;
    }

}