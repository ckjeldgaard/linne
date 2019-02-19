import {Photo} from "./photo";

export class RawPhoto implements Photo {

    constructor(private readonly imageData: ImageData) {}

    draw(): Promise<ImageData> {
        return new Promise((resolve) => {
            resolve(this.imageData);
        });
    }

}
