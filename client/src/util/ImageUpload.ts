import {Coin} from "../model/coin";
import {Side} from "../model/side";
import {ImageFileConverter} from "./ImageFileConverter";
import * as config from "react-global-configuration";
import * as firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";
import UploadTaskSnapshot = firebase.storage.UploadTaskSnapshot;
import {ResizePhoto} from "./ResizePhoto";
import {ContrastPhoto} from "./ContrastPhoto";
import {BrightenPhoto} from "./BrightenPhoto";
import {CroppedPhoto} from "./CroppedPhoto";
import {ClassifiedCoin} from "../model/classified-coin";
import {RotatePhoto} from "./RotatePhoto";

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

    async upload(): Promise<void> {
        // this.uploadOriginal();

        let photo = new ResizePhoto(
            new ContrastPhoto(
                new BrightenPhoto(
                    new CroppedPhoto(this.blob, this.originalImageWidth, this.originalImageHeight),
                    50),
                90),
            28,
            28
        );

        const imageData = await photo.draw();

        this.uploadOriginal(async (snapshot: UploadTaskSnapshot, downloadUrl: string) => {

            const coin = new ClassifiedCoin(snapshot.metadata.name, downloadUrl, this.chosenCoin.id, this.chosenSide, 0, imageData);
            console.log("coin = ", coin.toObject());
            this.writeCoinToDatabase(coin);

            // Upload 3 additional versions of the image rotated 90 degrees each:
            for (let i = 90; i < 360; i += 90) {
                const rotatedImage = await new RotatePhoto(photo, i).draw();
                const coin = new ClassifiedCoin(snapshot.metadata.name, downloadUrl, this.chosenCoin.id, this.chosenSide, i, rotatedImage);
                this.writeCoinToDatabase(coin);
            }

            console.log("Successfully uploaded!", snapshot);
        });
    }

    private writeCoinToDatabase(classifiedImage: ClassifiedCoin): void {
        const db: firebase.firestore.Firestore = this.firebaseApp.firestore();
        const key: string = db.collection("coins").doc().id;

        db.collection("coins").doc(key)
            .set(classifiedImage.toObject())
            .then(() => {
                console.log("Coin successfully written!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);

            });
    }

    private uploadOriginal(onFulfilled: ((snapshot: firebase.storage.UploadTaskSnapshot, downloadUrl: string) => any)): void {
        const fileName = uuidv1() + ".jpg";
        const file: File = new ImageFileConverter(this.blob).toFile(fileName);

        const storageRef = this.firebaseApp.storage().ref();
        const originalsRef = storageRef.child("originals/" + fileName);

        originalsRef.put(file).then((snapshot: UploadTaskSnapshot) => {
            snapshot.ref.getDownloadURL().then((downloadURL: string) => {
                onFulfilled(snapshot, downloadURL);
            });

        }).catch(reason => {
            console.error("Upload failed", reason);
        });

    }
}