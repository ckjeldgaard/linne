export class Compound {

    constructor(private readonly _images: number[][][], private readonly _labels: number[]) {}

    get images(): number[][][] {
        return this._images;
    }

    get labels(): number[] {
        return this._labels;
    }
}