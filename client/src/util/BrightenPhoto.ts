import {Photo} from "./Photo";

export class BrightenPhoto implements Photo {

    constructor(private readonly origin: Photo, private readonly brightness: number) {}

    async draw(): Promise<ImageData> {
        const imgData = await this.origin.draw();
        let data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] += this.brightness;
            data[i + 1] += this.brightness;
            data[i + 2] += this.brightness;
        }
        return imgData;
    }

}