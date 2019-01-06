import * as React from "react";
import {ReactNode} from "react";
import * as firebase from "firebase";
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

        console.log("model url = ", modelUrl);

        const tshirtJson = require('./tshirt.json');

        console.log("tshirtJson = ", tshirtJson);

        let canvasContext = this.preview.getContext("2d");
        const imageData = await new Plot(
            new Transform().toMatrix(tshirtJson),
            100
        ).toCanvasImageData();
        canvasContext.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);
    }

    render(): ReactNode {
        return <article>
            <h1>Detect</h1>
            <canvas ref={(p) => {this.preview = p; }} width="100" height="100"></canvas>
        </article>;
    }

}
