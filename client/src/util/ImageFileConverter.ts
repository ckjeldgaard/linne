export class ImageFileConverter {

    constructor(private readonly blob: Blob) {}

    public toFile = (fileName: string): File => {
        return new File([this.blob], fileName, {type: "image/jpeg"});
    }
}