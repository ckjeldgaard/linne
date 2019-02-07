import * as React from "react";
import {ReactNode} from "react";
import {CroppieOptions, ResultOptions} from "croppie";
import {Item} from "../../model/item";
import {ImageUpload} from "../../domain/image-upload";
import {Photo} from "../../domain/photo/photo";
// @ts-ignore
import Croppie = require("croppie");

export interface ImageProcessingProps {
    firebase: firebase.app.App;
    file: Blob;
    itemOptions: Item[];
    closeModal: any;
}

export interface ImageProcessingState {
    loading: boolean;
    chosenItem: Item | null;
    uploadDisabled: boolean;
}

export default class ImageProcessing extends React.Component<ImageProcessingProps, ImageProcessingState> {

    private _previewField: any;
    private fileReader = new FileReader();
    private select: string = "-- Select --";
    private imageUpload = new ImageUpload(this.props.firebase);
    private imageWidth: number = 200;
    private imageHeight: number = 200;
    private cropper: Croppie | null = null;

    constructor(props: ImageProcessingProps) {
        super(props);

        this.state = {
            loading: false,
            chosenItem: null,
            uploadDisabled: true,
        };

        this.fileReader.readAsDataURL(this.props.file);
        this.fileReader.onload = (ev) => {
            this._previewField.src = (ev.target as FileReader).result;

            this.setCropper();
        };

    }

    private setCropper(): void {
        const options: CroppieOptions = {
            viewport: { width: this.imageWidth, height: this.imageHeight, type: "square" },
            boundary: { width: 280, height: 280 },
            showZoomer: true,
            enableOrientation: true
        };

        this.cropper = new Croppie(this._previewField, options);
        this.cropper.bind({
            url: this._previewField.src
        });
    }

    private selectItem(event: React.FormEvent<HTMLSelectElement>): void {
        const chosen: Item | null = (event.currentTarget.value !== this.select) ? this.props.itemOptions[+event.currentTarget.value] : null;
        this.setState({
            chosenItem: chosen
        }, () => this.validateFields());
    }

    private validateFields(): void {
        this.setState({uploadDisabled: this.state.chosenItem == null});
    }

    private processImage(event: React.FormEvent<HTMLButtonElement>): void {
        if (this.cropper != null) {
            let options: ResultOptions = {
                format: "jpeg",
                type: "blob",
                circle: false
            };
            this.cropper.result(options).then(async (blob: Blob) => {
                console.log("Got a blob", blob);
                if (this.state.chosenItem != null) {
                    console.log("Starting upload...");
                    this.setState({loading: true});
                    try {
                        const result: Photo = await this.imageUpload.upload(blob,
                            this.imageWidth,
                            this.imageHeight,
                            this.state.chosenItem);
                        console.log("Successfully uploaded image", result);

                        this.props.closeModal();
                    } catch (e) {
                        console.error("Error uploading image", e);
                    }
                }
            });
        }
    }

    render(): ReactNode {
        return <div className="image-processing">
            <div className={this.state.loading ? "loader" : "loader hidden"} />
            <div className={this.state.loading ? "content dim" : "content"}>
            <p>Crop and classify image</p>
            <div>
                <img ref={(p) => {this._previewField = p; }} alt="Preview" />
            </div>
            <div className="controls">
                <div className="classify">
                    <label htmlFor="item">Item:
                        <select id="item" onChange={e => this.selectItem(e)}>
                            <option>-- Select --</option>{
                                this.props.itemOptions.map((item) => {
                                    return <option key={item.id} value={item.id}>{item.label}</option>;
                                })
                            }
                        </select>
                    </label>
                </div>
                <button className="btn--raised" disabled={this.state.uploadDisabled} onClick={e => this.processImage(e)}>Upload</button>
            </div>
            </div>
        </div>;
    }

}
