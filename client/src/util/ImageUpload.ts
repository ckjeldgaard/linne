import {Coin} from "../model/coin";
import {Side} from "../model/side";
import {ImageFileConverter} from "./ImageFileConverter";
import * as config from "react-global-configuration";
import * as firebase from "firebase/app";
import "firebase/storage";
import UploadTaskSnapshot = firebase.storage.UploadTaskSnapshot;

const uuidv1 = require("uuid/v1");

export class ImageUpload {

    private readonly firebaseApp: firebase.app.App;

    constructor(
        private readonly blob: Blob,
        private readonly originalImageWidth: number,
        private readonly originalImageHeight: number,
        private readonly chosenCoin: Coin,
        private readonly chosenSide: Side
    ) {
        this.firebaseApp = firebase.initializeApp(config.get("firebaseConfig"));
    }

    upload(): void {
        this.uploadOriginal();
    }

    private uploadOriginal(): void {
        console.log("original = ", this.blob);
        console.log("originalImageWidth = ", this.originalImageWidth);
        console.log("originalImageHeight = ", this.originalImageHeight);
        console.log("chosenCoin = ", this.chosenCoin);
        console.log("chosenSide = ", this.chosenSide);

        const fileName = uuidv1() + ".jpg";
        const file: File = new ImageFileConverter(this.blob).toFile(fileName);

        console.log("file = ", file);
        console.log("config = ", this.firebaseApp);


        const storageRef = this.firebaseApp.storage().ref();
        const originalsRef = storageRef.child("originals/" + fileName);

        originalsRef.put(file).then((snapshot: UploadTaskSnapshot) => {
            console.log("Successfully uploaded!", snapshot);
        }).catch(reason => {
            console.error("Upload failed", reason);
        });

    }
}