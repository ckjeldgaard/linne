import * as React from "react";
import {ReactNode} from "react";
import * as firebase from "firebase";
import * as tf from "@tensorflow/tfjs";
import {Tensor3D} from "@tensorflow/tfjs";
import {Transform} from "../../domain/transform";
import {Model, Tensor, Rank} from "@tensorflow/tfjs";
import {ResizePhoto} from "../../domain/photo/resize-photo";
import {ContrastPhoto} from "../../domain/photo/contrast-photo";
import {BrightenPhoto} from "../../domain/photo/brighten-photo";
import {CroppedPhoto} from "../../domain/photo/cropped-photo";
import {ImageUpload} from "../../domain/image-upload";
import {Item} from "../../model/item";

export interface DetectProps {
    firebase: firebase.app.App;
}

export interface DetectState {
    prediction: string;
}

export default class Detect extends React.Component<DetectProps, DetectState> {

    private preview: HTMLCanvasElement | null = null;
    private video: HTMLVideoElement | null = null;
    private model: Model | null = null;

    private labels: Item[] = [
        { "id": 0, "label": "T-shirt/top" },
        { "id": 1, "label": "Trouser" },
        { "id": 2, "label": "Pullover" },
        { "id": 3, "label": "Dress" },
        { "id": 4, "label": "Coat" },
        { "id": 5, "label": "Sandal" },
        { "id": 6, "label": "Shirt" },
        { "id": 7, "label": "Sneaker" },
        { "id": 8, "label": "Bag" },
        { "id": 9, "label": "Ankle boot" },
    ];

    constructor(props: DetectProps, state: DetectState) {
        super(props, state);

        this.state = { prediction: "" };
    }

    async componentDidMount(): Promise<void> {
        await this.getModelFiles();
        this.accessWebcam();
    }

    private async accessWebcam(): Promise<void> {
        if (navigator.mediaDevices.getUserMedia && this.video != null) {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({video: true});
                this.video.srcObject = mediaStream;

                const track = mediaStream.getVideoTracks()[0];
                window.setInterval(async () => {
                    let imageCapture = new ImageCapture(track);
                    const bitmap = await imageCapture.grabFrame();
                    console.log("bitmap", bitmap);
                    this.retrieveImage(bitmap);
                }, 500);

            } catch (e) {
                console.error("Something went wrong when retrieving media stream!", e);
            }
        }
    }

    private retrieveImage(img: ImageBitmap): void {
        if (this.preview != null) {
            const context = this.preview.getContext("2d");
            if (context != null) {
                const sourceX = (img.width - img.height) / 2;
                const sourceY = 0;
                const sourceWidth = img.height;
                const sourceHeight = img.height;
                const destWidth = this.preview.width;
                const destHeight = this.preview.height;
                const destX = 0;
                const destY = 0;

                context.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
                this.preview.toBlob(async (blob: Blob | null) => {
                    if (blob != null && this.preview != null) {
                        let photo = new ResizePhoto(
                            new ContrastPhoto(
                                new BrightenPhoto(
                                    new CroppedPhoto(blob, this.preview.width, this.preview.height),
                                    ImageUpload.BRIGHTNESS),
                                ImageUpload.CONTRAST),
                            ImageUpload.IMAGE_SIZE_PIXELS,
                            ImageUpload.IMAGE_SIZE_PIXELS
                        );

                        const imageData = await photo.draw();
                        const matrix = new Transform().toMatrix(new Transform().toObjectList(imageData));

                        console.log("matrix", matrix);

                        // const greyImageData = await new Plot(matrix,200).toCanvasImageData();
                        // context.putImageData(greyImageData, 0, 0, 0, 0, greyImageData.width, greyImageData.height);

                        this.predictMatrix(matrix);
                    }
                });
            }
        }
    }

    private async getModelFiles(): Promise<void> {
        const storage: firebase.storage.Storage = this.props.firebase.storage();
        const modelUrl = await storage.ref("model.json").getDownloadURL();
        const weightsUrl = await storage.ref("weights.bin").getDownloadURL();

        const modelJsonFile = await this.downloadStorageFile(modelUrl, "model.json", "application/json");
        const weightsFile = await this.downloadStorageFile(weightsUrl, "weights.bin", "application/octet-stream");

        this.model = await tf.loadModel(tf.io.browserFiles([modelJsonFile, weightsFile]));
    }

    private async predictMatrix(matrix: number[][]): Promise<void> {
        if (this.model != null) {
            const tshirtTensor: Tensor3D = tf.tensor3d([matrix], [1, 28, 28]);

            const prediction: Tensor<Rank> = this.model.predict(tshirtTensor) as Tensor<Rank>;
            const data = await prediction.as1D().data();
            const argMax = await prediction.as1D().argMax().data();
            console.log("data = ", data);
            console.log("argMax = ", argMax[0]);

            const pct = (data[argMax[0]] * 100).toFixed(2);

            let predictionText = "Detecting...";
            if ((data[argMax[0]] * 100) > 80.0) {
                predictionText = this.labels[argMax[0]].label + " (" + pct + " %)";
            }

            this.setState({
                prediction: predictionText
            });
        }
    }

    /* private async predictMatrix() {
        const tshirtJson = require('./trousers.json');
        const tshirtMatrix = new Transform().toMatrix(tshirtJson);
        const tshirtTensor: Tensor3D = tf.tensor3d([tshirtMatrix], [1, 28, 28]);

        console.log("tshirtMatrix = ", tshirtMatrix);
        console.log("tshirtTensor = ", tshirtTensor);

        const pre = this.model.predict(tshirtTensor);
        console.log("predict = ", pre.toString());

        // Plot image:
        let canvasContext = this.preview.getContext("2d");
        const imageData = await new Plot(tshirtMatrix,100).toCanvasImageData();
        canvasContext.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);
    } */

    private downloadStorageFile(url: string, fileName: string, type: string): Promise<File> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = "blob";
            xhr.onload = (event) => {
                const file = new File([xhr.response], fileName, {type: type});
                resolve(file);
            };
            xhr.onerror = (error) => {
              reject(error);
            };
            xhr.open("GET", url);
            xhr.send();
        });
    }

    render(): ReactNode {
        return <article>
            <h1>Detect</h1>
            <canvas id="preview-canvas" ref={(p) => {this.preview = p; }} width="200" height="200" />
            <p>{this.state.prediction}</p>
            <div className="container">
                <video ref={(v) => {this.video = v; }} autoPlay={true} id="webcam" />
            </div>
        </article>;
    }

}
