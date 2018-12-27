import {Photo} from "./photo";

export class GreyPhoto implements Photo {

    constructor(private readonly origin: Photo) {}

    async draw(): Promise<ImageData> {

        const imgPixels = await this.origin.draw();
        for (let y = 0; y < imgPixels.height; y++) {
            for (let x = 0; x < imgPixels.width; x++) {
                let i = (y * 4) * imgPixels.width + x * 4;
                let avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                imgPixels.data[i] = avg;
                imgPixels.data[i + 1] = avg;
                imgPixels.data[i + 2] = avg;
            }
        }

        return imgPixels;
    }

}