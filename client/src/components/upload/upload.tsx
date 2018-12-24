import * as React from "react";
import {ReactNode} from "react";

export default class Upload extends React.Component {

    private _fileField: any;
    private _previewField: any;
    private fileReader = new FileReader();

    constructor() {
        super({});
        this.onFileChosen = this.onFileChosen.bind(this);
    }

    private onFileChosen(event: any): void {
        this.fileReader.readAsDataURL(this._fileField.files[0]);
        this.fileReader.onload = (ev) => {
            this._previewField.src = (ev.target as FileReader).result;
        };
    }

    render(): ReactNode {
        return <article className="upload">
            <input type="file" accept="image/*" capture ref={(f) => {this._fileField = f; }} onChange={this.onFileChosen} />
            <img ref={(p) => {this._previewField = p; }} alt="Preview" />
        </article>;
    }

}
