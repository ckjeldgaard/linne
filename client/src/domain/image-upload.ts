import {Item} from "../model/item";
import {ImageFileConverter} from "./image-file-converter";
import * as firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";
import {ResizePhoto} from "./photo/resize-photo";
import {ContrastPhoto} from "./photo/contrast-photo";
import {BrightenPhoto} from "./photo/brighten-photo";
import {CroppedPhoto} from "./photo/cropped-photo";
import {ClassifiedItem} from "../model/classified-item";
import {Photo} from "./photo/photo";
import {MirrorPhoto} from "./photo/mirror-photo";

const uuidv1 = require("uuid/v1");

export class ImageUpload {

    private readonly firebaseApp: firebase.app.App;

    private static readonly BRIGHTNESS: number = 50;
    private static readonly CONTRAST: number = 90;
    private static readonly IMAGE_SIZE_PIXELS: number = 28;

    constructor(firebase: firebase.app.App) {
        this.firebaseApp = firebase;
    }

    async upload(blob: Blob, originalImageWidth: number, originalImageHeight: number, chosenItem: Item): Promise<Photo> {
        let photo = new ResizePhoto(
            new ContrastPhoto(
                new BrightenPhoto(
                    new CroppedPhoto(blob, originalImageWidth, originalImageHeight),
                    ImageUpload.BRIGHTNESS),
                ImageUpload.CONTRAST),
            ImageUpload.IMAGE_SIZE_PIXELS,
            ImageUpload.IMAGE_SIZE_PIXELS
        );

        const imageData = await photo.draw();

        const snapshot = await this.uploadOriginal(blob);
        const downloadUrl = await ImageUpload.getImageDownloadUrl(snapshot.ref);

        const item = new ClassifiedItem(snapshot.metadata.name, downloadUrl, chosenItem.id, false, imageData);
        console.log("item = ", item.toObject());

        const itemRequests = [];
        itemRequests.push(this.writeItemToDatabase(item));

        // Upload a horizontally mirrored version of the image:
        const mirroredImage = await new MirrorPhoto(photo).draw();
        const mirrorItem = new ClassifiedItem(snapshot.metadata.name, downloadUrl, chosenItem.id, true, mirroredImage);
        itemRequests.push(this.writeItemToDatabase(mirrorItem));

        await Promise.all(itemRequests);
        return photo;
    }

    private async writeItemToDatabase(classifiedImage: ClassifiedItem): Promise<void> {
        const db: firebase.firestore.Firestore = this.firebaseApp.firestore();
        const key: string = db.collection("items").doc().id;
        return await db.collection("items").doc(key).set(classifiedImage.toObject());
    }

    private async uploadOriginal(blob: Blob): Promise<firebase.storage.UploadTaskSnapshot> {
        const fileName = uuidv1() + ".jpg";
        const file: File = new ImageFileConverter(blob).toFile(fileName);

        const storageRef = this.firebaseApp.storage().ref();
        const originalsRef = storageRef.child("originals/" + fileName);

        return await originalsRef.put(file);
    }

    private static async getImageDownloadUrl(ref: firebase.storage.Reference): Promise<string> {
        return await ref.getDownloadURL();
    }
}
