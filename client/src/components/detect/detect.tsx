import * as React from "react";
import {ReactNode} from "react";
import * as firebase from "firebase";
import * as tf from "@tensorflow/tfjs";
import {Tensor3D} from "@tensorflow/tfjs";
import {Plot} from "../../domain/plot";
import {Transform} from "../../domain/transform";

export interface DetectProps {
    firebase: firebase.app.App;
}

export default class Detect extends React.Component<DetectProps> {

    private preview: any;

    constructor(props: DetectProps) {
        super(props);
        this.getModelFiles();
    }

    private async getModelFiles(): Promise<void> {
        const storage: firebase.storage.Storage = this.props.firebase.storage();
        const modelUrl = await storage.ref("model.json").getDownloadURL();
        const weightsUrl = await storage.ref("weights.bin").getDownloadURL();

        console.log("model url = ", modelUrl);
        console.log("weights url = ", weightsUrl);

        const modelJsonFile = await this.downloadStorageFile(modelUrl, "model.json", "application/json");
        const weightsFile = await this.downloadStorageFile(weightsUrl, "weights.bin", "application/octet-stream");
        console.log("modelJsonFile = ", modelJsonFile);
        console.log("weightsFile = ", weightsFile);
        
        const model = await tf.loadModel(tf.io.browserFiles([modelJsonFile, weightsFile]));

        console.log("model = ", model);

        const tshirtJson = require('./trousers.json');
        const tshirtMatrix = new Transform().toMatrix(tshirtJson);
        const tshirtTensor: Tensor3D = tf.tensor3d([tshirtMatrix], [1, 28, 28]);

        console.log("tshirtMatrix = ", tshirtMatrix);
        console.log("tshirtTensor = ", tshirtTensor);

        const pre = model.predict(tshirtTensor);
        console.log("predict = ", pre.toString());

        // Plot image:
        let canvasContext = this.preview.getContext("2d");
        const imageData = await new Plot(tshirtMatrix,100).toCanvasImageData();
        canvasContext.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);
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
            <canvas ref={(p) => {this.preview = p; }} width="100" height="100"></canvas>
        </article>;
    }

}
