export class Transform {

    public toMatrix(imageData: object[]): number[][] {
        const matrix: number[][] = [];
        imageData.forEach((row: object) => {
            const matrixRow: number[] = [];

            Object.keys(row).forEach(key => {
                if (row.hasOwnProperty(key)) {
                    const val = (row as any)[key];
                    matrixRow.push(val);
                }
            });
            matrix.push(matrixRow);
        });
        return matrix;
    }

    public toObjectList(imageData: ImageData): object[] {
        let matrix: object[] = [];
        for (let y = 0; y < imageData.height; y++) {
            let row = [];
            for (let x = 0; x < imageData.width; x++) {
                let i = (y * 4) * imageData.width + x * 4;
                row[x] = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3) / 255;
            }
            let obj = {};
            Object.assign(obj, row);
            matrix.push(obj);
        }
        return matrix;
    }

}