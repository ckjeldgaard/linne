import * as React from "react";
import {ReactNode} from "react";
import {Croppie, CroppieOptions} from "croppie";
import {Coin} from "../../model/coin";
import {Side} from "../../model/side";
import {CroppedPhoto} from "../../util/CroppedPhoto";
import {GreyPhoto} from "../../util/GreyPhoto";
import {ContrastPhoto} from "../../util/ContrastPhoto";
import {BrightenPhoto} from "../../util/BrightenPhoto";
import {ResizePhoto} from "../../util/ResizePhoto";
import {RotatePhoto} from "../../util/RotatePhoto";

export interface ImageProcessingProps {
    file: Blob;
    coinOptions: Coin[];
}

export interface ImageProcessingState {
    chosenCoin: Coin | null;
    chosenSide: Side | null;
    uploadDisabled: boolean;
}

export default class ImageProcessing extends React.Component<ImageProcessingProps, ImageProcessingState> {

    private _previewField: any;
    private processed: any;
    private fileReader = new FileReader();
    private select: string = "-- Select --";
    private imageWidth: number = 200;
    private imageHeight: number = 200;
    private cropper: Croppie;

    constructor(props: ImageProcessingProps) {
        super(props);

        console.log("props = ", this.props);

        this.state = {
            chosenCoin: null,
            chosenSide: null,
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
            viewport: { width: this.imageWidth, height: this.imageHeight, type: "circle" },
            boundary: { width: 300, height: 300 },
            showZoomer: true,
            enableOrientation: true
        };

        this.cropper = new Croppie(this._previewField, options);
        this.cropper.bind({
            url: this._previewField.src
        });
    }

    private selectCoin(event: React.FormEvent<HTMLSelectElement>): void {
        const chosen: Coin | null = (event.currentTarget.value !== this.select) ? this.props.coinOptions[+event.currentTarget.value] : null;
        this.setState({
            chosenCoin: chosen
        }, () => this.validateFields());
    }

    private selectSide(event: React.FormEvent<HTMLSelectElement>): void {
        switch (event.currentTarget.value) {
            case "Observe":
                this.setState({chosenSide: Side.Observe}, () => this.validateFields());
                break;
            case "Reverse":
                this.setState({chosenSide: Side.Reverse}, () => this.validateFields());
                break;
            default:
                this.setState({chosenSide: null}, () => this.validateFields());
                break;
        }
    }

    private validateFields(): void {
        this.setState({uploadDisabled: (!(this.state.chosenCoin != null && this.state.chosenSide != null))});
    }

    private processImage(event: React.FormEvent<HTMLButtonElement>): void {
        this.cropper.result("blob").then(async (blob: Blob) => {
            console.log("blob", blob);

            let canvasContext = this.processed.getContext("2d");

            let photo = new ResizePhoto(
                new ContrastPhoto(
                    new BrightenPhoto(
                        new GreyPhoto(
                            new CroppedPhoto(blob, this.imageWidth, this.imageHeight)
                        ),
                        50),
                    90),
                28,
                28
            );
            // photo = new ResizePhoto(photo, 200, 200);
            const rphoto = new RotatePhoto(photo, 90);

            const imageData = await rphoto.draw();

            console.log("imageData = ", imageData);
            console.log("imageData = ", imageData.width);
            console.log("imageData = ", imageData.height);

            canvasContext.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);

        });
    }

    render(): ReactNode {
        return <div className="image-processing">
            <canvas ref={(p) => {this.processed = p; }} width="28" height="28" />
            <p>Crop and classify image</p>
            <div>
                <img ref={(p) => {this._previewField = p; }} alt="Preview" />
            </div>
            <div className="controls">
                <div className="classify">
                    <label htmlFor="coin">Coin:
                        <select id="coin" onChange={e => this.selectCoin(e)}>
                            <option>-- Select --</option>{
                                this.props.coinOptions.map((coin) => {
                                    return <option key={coin.id} value={coin.id}>{coin.label}</option>;
                                })
                            }
                        </select>
                    </label>
                    <label htmlFor="side">Side:
                        <select id="side" onChange={e => this.selectSide(e)}>
                            <option>-- Select --</option>
                            <option>Observe</option>
                            <option>Reverse</option>
                        </select>
                    </label>
                </div>
                <button className="btn--raised" disabled={this.state.uploadDisabled} onClick={e => this.processImage(e)}>Upload</button>
            </div>
        </div>;
    }

}
