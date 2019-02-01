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
import {ImageUpload} from "../../domain/image-upload";
import {Item} from "../../model/item";
import {Plot} from "../../domain/plot";
import {ImagePyramid} from "../../domain/object_detection/image-pyramid";
import {SlidingWindow} from "../../domain/object_detection/sliding-window";
import {RawPhoto} from "../../domain/photo/raw-photo";
import {Prediction} from "../../model/prediction";
import {MatchCandidate} from "../../model/match-candidate";

export interface DetectProps {
    firebase: firebase.app.App;
}

export interface DetectState {
    prediction: string;
}

export default class Detect extends React.Component<DetectProps, DetectState> {

    private preview: HTMLCanvasElement | null = null;
    private webcamCanvas: HTMLCanvasElement = document.createElement("canvas");
    private webcamContext: CanvasRenderingContext2D = this.webcamCanvas.getContext("2d") as CanvasRenderingContext2D;
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
        await this.getModelFiles();
        if (this.preview != null) {
            this.canvasContext = this.preview.getContext("2d") as CanvasRenderingContext2D;
        }

        this.accessWebcam();
    }

    private canvasContext: CanvasRenderingContext2D | null = null;

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

                window.setInterval(async () => {
                    let imageCapture = new ImageCapture(track);
                    const bitmap = await imageCapture.grabFrame();
                    this.classify(bitmap);

               }, 750);

            } catch (e) {
                console.error("Something went wrong when retrieving media stream!", e);
            }
        }
    }

    private drawOutline(x: number, y: number, w: number = 128, h: number = 128) {
        if (this.canvasContext != null) {
            this.canvasContext.clearRect(0, 0, 640, 480);
            this.canvasContext.lineWidth = 3;
            this.canvasContext.strokeStyle = "red";
            this.canvasContext.strokeRect(x, y, w, h);
        }

    }

    private async classify(img: ImageBitmap): Promise<void> {

        this.webcamCanvas.width = img.width;
        this.webcamCanvas.height = img.height;
        this.webcamContext.drawImage(img, 0, 0);

        const candidates: MatchCandidate[] = [];

        for (const p of new ImagePyramid(this.webcamContext).pyramids()) {
            for (const window of new SlidingWindow(p).windows()) {
                let photo = new ResizePhoto(
                    new ContrastPhoto(
                        new BrightenPhoto(
                            new RawPhoto(window.imageData),
                            ImageUpload.BRIGHTNESS),
                        ImageUpload.CONTRAST),
                    ImageUpload.IMAGE_SIZE_PIXELS,
                    ImageUpload.IMAGE_SIZE_PIXELS
                );

                const imageData = await photo.draw();
                const matrix = new Transform().toMatrix(new Transform().toObjectList(imageData));

                // this.plot(matrix);
                const pct = await this.predictMatrix(matrix);
                // console.log("p.width [" + p.width + "], p.height [" + p.height + "], x = [" + x + "], y = [" + y + "], pct = ", pct);
                if (pct.pct > 90) {
                    candidates.push({
                        windowWidth: p.width,
                        windowHeight: p.height,
                        x: window.x,
                        y: window.y,
                        pct: pct.pct,
                        label: pct.labelIndex
                    });
                }
            }

        }

        this.outlineBestMatch(candidates);
    }

    private outlineBestMatch(candidates: MatchCandidate[]) {
        console.log("candidates", candidates);
        console.log("candidates.l", candidates.length);
        let i = 0;
        let bestMatch = candidates[i];
        for (let c of candidates) {
            if (c.pct > bestMatch.pct) {
                bestMatch = c;
            }
            i++;
        }

        const f = 640 / bestMatch.windowWidth;

        console.log("bestMatch", bestMatch);
        this.drawOutline(
            (bestMatch.x * f),
            (bestMatch.y * f),
            (128 * f),
            (128 * f)
        );

        const predictionText: string = this.labels[bestMatch.label].label + " (" + bestMatch.pct.toFixed(2) + " %)";
        this.setState({
            prediction: predictionText
        });
    }

    private async plot(matrix: number[][]): Promise<void> {
        if (this.matrixCanvas != null) {
            const context = this.matrixCanvas.getContext("2d");
            if (context != null) {
                const greyImageData = await new Plot(matrix, this.matrixCanvas.width).toCanvasImageData();
                context.putImageData(greyImageData, 0, 0, 0, 0, greyImageData.width, greyImageData.height);
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

    private async predictMatrix(matrix: number[][]): Promise<Prediction> {

        return new Promise(async (resolve, reject) => {
            if (this.model != null) {
                const clothingTensor: Tensor3D = tf.tensor3d([matrix], [1, 28, 28]);

                const prediction: Tensor<Rank> = this.model.predict(clothingTensor) as Tensor<Rank>;
                const data = await prediction.as1D().data();
                const argMax = await prediction.as1D().argMax().data();

                resolve({labelIndex: argMax[0], pct: (data[argMax[0]] * 100) });
            } else {
                reject();
            }
        });

        /* if (this.model != null) {
            const clothingTensor: Tensor3D = tf.tensor3d([matrix], [1, 28, 28]);

            const prediction: Tensor<Rank> = this.model.predict(clothingTensor) as Tensor<Rank>;
            const data = await prediction.as1D().data();
            const argMax = await prediction.as1D().argMax().data();

            const pct = (data[argMax[0]] * 100).toFixed(2);

            let predictionText = "Detecting...";
            if ((data[argMax[0]] * 100) > 90.0) {
                predictionText = this.labels[argMax[0]].label + " (" + pct + " %)";
            }

            this.setState({
                prediction: predictionText
            });
        } */
    }

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
            <p>{this.state.prediction}</p>
            <div className="container">
                <video ref={(v) => {this.video = v; }} autoPlay={true} id="webcam" />
                <canvas id="preview-canvas" ref={(p) => {this.preview = p; }} width="640" height="480" />
            </div>
            <div className="matrix-canvas-container">
                <canvas id="matrix-canvas" ref={(p) => {this.matrixCanvas = p; }} width="150" height="150" />
            </div>
        </article>;
    }

}
