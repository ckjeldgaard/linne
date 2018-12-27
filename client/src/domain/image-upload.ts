import {Coin} from "../model/coin";
import {Side} from "../model/side";
import {ImageFileConverter} from "./image-file-converter";
import * as config from "react-global-configuration";
import * as firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";
import {ResizePhoto} from "./photo/resize-photo";
import {ContrastPhoto} from "./photo/contrast-photo";
import {BrightenPhoto} from "./photo/brighten-photo";
import {CroppedPhoto} from "./photo/cropped-photo";
import {ClassifiedCoin} from "../model/classified-coin";
import {RotatePhoto} from "./photo/rotate-photo";

const uuidv1 = require("uuid/v1");

export class ImageUpload {

    private readonly firebaseApp: firebase.app.App;

    private static readonly BRIGHTNESS: number = 50;
    private static readonly CONTRAST: number = 90;
    private static readonly IMAGE_SIZE_PIXELS: number = 28;

    constructor(
        private readonly blob: Blob,
        private readonly originalImageWidth: number,
        private readonly originalImageHeight: number,
        private readonly chosenCoin: Coin,
        private readonly chosenSide: Side
    ) {
        this.firebaseApp = firebase.initializeApp(config.get("firebaseConfig"));
    }

    async upload(): Promise<void[]> {
        let photo = new ResizePhoto(
            new ContrastPhoto(
                new BrightenPhoto(
                    new CroppedPhoto(this.blob, this.originalImageWidth, this.originalImageHeight),
                    ImageUpload.BRIGHTNESS),
                ImageUpload.CONTRAST),
            ImageUpload.IMAGE_SIZE_PIXELS,
            ImageUpload.IMAGE_SIZE_PIXELS
        );

        const imageData = await photo.draw();

        const snapshot = await this.uploadOriginal();
        const downloadUrl = await ImageUpload.getImageDownloadUrl(snapshot.ref);

        const coin = new ClassifiedCoin(snapshot.metadata.name, downloadUrl, this.chosenCoin.id, this.chosenSide, 0, imageData);
        console.log("coin = ", coin.toObject());

        const coinRequests = [];
        coinRequests.push(this.writeCoinToDatabase(coin));

        // Upload 3 additional versions of the image rotated 90 degrees each:
        for (let i = 90; i < 360; i += 90) {
            const rotatedImage = await new RotatePhoto(photo, i).draw();
            const coin = new ClassifiedCoin(snapshot.metadata.name, downloadUrl, this.chosenCoin.id, this.chosenSide, i, rotatedImage);
            coinRequests.push(this.writeCoinToDatabase(coin));
        }

        return await Promise.all(coinRequests);
    }

    private async writeCoinToDatabase(classifiedImage: ClassifiedCoin): Promise<void> {
        const db: firebase.firestore.Firestore = this.firebaseApp.firestore();
        const key: string = db.collection("coins").doc().id;
        return await db.collection("coins").doc(key).set(classifiedImage.toObject());
    }

    private async uploadOriginal(): Promise<firebase.storage.UploadTaskSnapshot> {
        const fileName = uuidv1() + ".jpg";
        const file: File = new ImageFileConverter(this.blob).toFile(fileName);

        const storageRef = this.firebaseApp.storage().ref();
        const originalsRef = storageRef.child("originals/" + fileName);

        return await originalsRef.put(file);
    }

    private static async getImageDownloadUrl(ref: firebase.storage.Reference): Promise<string> {
        return await ref.getDownloadURL();
    }
}