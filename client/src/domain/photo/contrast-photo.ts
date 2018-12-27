import {Photo} from "./photo";

export class ContrastPhoto implements Photo {

    constructor(private readonly origin: Photo, private readonly contrastPct: number) {}

    async draw(): Promise<ImageData> {
        const imgData = await this.origin.draw();
        let data = imgData.data;
        const contrast = (this.contrastPct / 100) + 1; // convert to decimal & shift range: [0..2]
        const intercept = 128 * (1 - contrast);
        for (let i = 0; i < data.length; i += 4) { // r,g,b,a
            data[i] = data[i] * contrast + intercept;
            data[i + 1] = data[i + 1] * contrast + intercept;
            data[i + 2] = data[i + 2] * contrast + intercept;
        }
        return imgData;
    }

}