export class ClassifiedItem {

    constructor(private readonly originalRef: string,
    private readonly originalRefUrl: string,
    private readonly itemLabel: number,
    private readonly degrees: number,
    private readonly imageData: ImageData) {}

    public toObject(): object {
        return {
            originalRef: this.originalRef,
            originalRefUrl: this.originalRefUrl,
            itemLabel: this.itemLabel,
            degrees: this.degrees,
            image: this.toImageMatrix()
        };
    }

    private toImageMatrix(): object[] {
        let matrix: object[] = [];
        for (let y = 0; y < this.imageData.height; y++) {
            let row = [];
            for (let x = 0; x < this.imageData.width; x++) {
                let i = (y * 4) * this.imageData.width + x * 4;
                row[x] = Math.round((this.imageData.data[i] + this.imageData.data[i + 1] + this.imageData.data[i + 2]) / 3);
            }
            let obj = {};
            Object.assign(obj, row);
            matrix.push(obj);
        }
        return matrix;
    }

}