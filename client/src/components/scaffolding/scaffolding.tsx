import * as React from "react";
import {ReactNode} from "react";
import * as config from "react-global-configuration";
import * as firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";

export interface ScaffoldingState {
    status: string;
}

export default class Scaffolding extends React.Component<{}, ScaffoldingState> {

    private readonly firebaseApp: firebase.app.App;

    constructor() {
        super({});

        this.state = {status: "Ready"};
        this.firebaseApp = firebase.initializeApp(config.get("firebaseConfig"));
    }

    private fetch(event: React.FormEvent<HTMLButtonElement>): void {
        const images = require("./train_images.json");
        const labels = require("./train_labels.json");
        console.log("JSON loaded");

        images.forEach(async (item: number[][], index: number) => {

            const dbObject: object = {
                originalRef: null,
                originalRefUrl: null,
                itemLabel: labels[index],
                mirrored: false,
                image: this.toDbMatrix(item)
            };

            await this.writeItemToDatabase(dbObject);

            const num = index + 1;
            this.setState({status: "Items uploaded: " + num});
        });
        console.log("Done writing to database.");
    }

    private toDbMatrix(item: number[][]): object[] {
        let matrix: object[] = [];

        for (let x = 0; x < item.length; x++) {
            let obj = {};
            Object.assign(obj, item[x]);
            matrix.push(obj);
        }

        return matrix;
    }

    private async writeItemToDatabase(obj: object): Promise<void> {
        const db: firebase.firestore.Firestore = this.firebaseApp.firestore();
        const key: string = db.collection("training").doc().id;
        return await db.collection("training").doc(key).set(obj);
    }

    render(): ReactNode {
        return <article>
            <h1>Scaffolding</h1>
            <button onClick={e => this.fetch(e)}>Fetch</button>
            <p>{this.state.status}</p>
        </article>;
    }

}
