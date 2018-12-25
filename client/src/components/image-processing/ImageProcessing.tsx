import * as React from "react";
import {ReactNode} from "react";

export interface ImageProcessingProps {
    file: Blob;
}

export default class ImageProcessing extends React.Component<ImageProcessingProps> {

    private _previewField: any;
    private fileReader = new FileReader();

    constructor(props: ImageProcessingProps) {
        super(props);

        console.log("props = ", this.props);

        this.fileReader.readAsDataURL(this.props.file);
        this.fileReader.onload = (ev) => {
            this._previewField.src = (ev.target as FileReader).result;
        };
    }

    render(): ReactNode {
        return <div className="image-processing">
            <p>ImageProcessing</p>
            <img ref={(p) => {this._previewField = p; }} alt="Preview" />
        </div>;
    }

}
