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
import {Plot} from "../../domain/plot";

export interface DetectProps {
    firebase: firebase.app.App;
}

export interface DetectState {
    prediction: string;
}

export default class Detect extends React.Component<DetectProps, DetectState> {

    private preview: HTMLCanvasElement | null = null;
    private matrixCanvas: HTMLCanvasElement | null = null;
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
        // First, download model files:
        await this.getModelFiles();

        // Then open webcam source and begin prediction:
        this.accessWebcam();
    }

    private async accessWebcam(): Promise<void> {
        if (navigator.mediaDevices.getUserMedia && this.video != null) {
            try {
                let front = false;
                const constraints = {
                    video: {
                        facingMode: (front ? "user" : "environment")
                    }
                };
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                this.video.srcObject = mediaStream;

                const track = mediaStream.getVideoTracks()[0];

                // Capture an image every half second:
                window.setInterval(async () => {
                    let imageCapture = new ImageCapture(track);
                    const bitmap = await imageCapture.grabFrame();
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

                // Crop a square image from the center of the webcam source (whether it's in potrait or landscape mode):
                const portrait: boolean = (img.width < img.height);

                const sourceX = (portrait) ? 0 : (img.width - img.height) / 2;
                const sourceY = (portrait) ? (img.height - img.width) / 2 : 0;
                const sourceWidth = (portrait) ? img.width : img.height;
                const sourceHeight = (portrait) ? img.width : img.height;
                const destWidth = this.preview.width;
                const destHeight = this.preview.height;
                const destX = 0;
                const destY = 0;

                context.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
                this.preview.toBlob(async (blob: Blob | null) => {
                    if (blob != null && this.preview != null) {

                        // Process the square image the same way images has been pre-processed before upload and training:
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

                        this.plot(matrix);
                        this.predictMatrix(matrix);
                    }
                });
            }
        }
    }

    /**
     * Plots a greyscale and processed square image to a <canvas> element at the bottom of the page.
     * @param matrix Expects a 2-dimensional array (i.e. matrix) of size 28x28.
     */
    private async plot(matrix: number[][]): Promise<void> {
        if (this.matrixCanvas != null) {
            const context = this.matrixCanvas.getContext("2d");
            if (context != null) {
                const greyImageData = await new Plot(matrix, this.matrixCanvas.width).toCanvasImageData();
                context.putImageData(greyImageData, 0, 0, 0, 0, greyImageData.width, greyImageData.height);
            }
        }
    }

    /**
     * Fetches the model.json and weights.bin TensorFlow.js files from Firebase storage.
     */
    private async getModelFiles(): Promise<void> {
        const storage: firebase.storage.Storage = this.props.firebase.storage();
        const modelUrl = await storage.ref("model.json").getDownloadURL();
        const weightsUrl = await storage.ref("weights.bin").getDownloadURL();

        const modelJsonFile = await this.downloadStorageFile(modelUrl, "model.json", "application/json");
        const weightsFile = await this.downloadStorageFile(weightsUrl, "weights.bin", "application/octet-stream");

        this.model = await tf.loadModel(tf.io.browserFiles([modelJsonFile, weightsFile]));
    }

    /**
     * Using the downloaded model to predict what object in currently in the webcam source using TensorFlow.js.
     * Prints the best guess label above the webcam.
     * @param matrix Expects a 2-dimensional array (i.e. matrix) of size 28x28.
     */
    private async predictMatrix(matrix: number[][]): Promise<void> {
        if (this.model != null) {
            const tensor: Tensor3D = tf.tensor3d([matrix], [1, 28, 28]);

            const prediction: Tensor<Rank> = this.model.predict(tensor) as Tensor<Rank>;
            const data = await prediction.as1D().data();
            const argMax = await prediction.as1D().argMax().data();

            const pct = (data[argMax[0]] * 100).toFixed(2);

            let predictionText = "Detecting...";
            if ((data[argMax[0]] * 100) > 60.0) {
                predictionText = this.labels[argMax[0]].label + " (" + pct + " %)";
            }

            this.setState({
                prediction: predictionText
            });
        }
    }

    /**
     * Helper function to download an external file from Firebase Storage.
     */
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
            <div className="matrix-canvas-container">
                <canvas id="matrix-canvas" ref={(p) => {this.matrixCanvas = p; }} width="150" height="150" />
            </div>
        </article>;
    }

}
