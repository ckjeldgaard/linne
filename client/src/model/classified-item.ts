import {Transform} from "../domain/transform";

export class ClassifiedItem {

    constructor(private readonly originalRef: string,
    private readonly originalRefUrl: string,
    private readonly itemLabel: number,
    private readonly mirrored: boolean,
    private readonly imageData: ImageData) {}

    public toObject(): object {
        return {
            originalRef: this.originalRef,
            originalRefUrl: this.originalRefUrl,
            itemLabel: this.itemLabel,
            mirrored: this.mirrored,
            image: new Transform().toObjectList(this.imageData)
        };
    }

}