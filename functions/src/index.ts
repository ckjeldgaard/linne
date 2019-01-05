import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Compound} from "./compound";

// The Firebase Admin SDK to access the Firestore Database.
firebase.initializeApp();

const getTrainingImages = async function(): Promise<Compound> {
    const images: number[][][] = [];
    const labels: number[] = [];

    const querySnapshot: firebase.firestore.QuerySnapshot = await firebase.firestore().collection("training")
        .select("image", "itemLabel")
        .limit(10)
        .get();
    querySnapshot.forEach((doc: DocumentSnapshot) => {
        const matrix = transformImageData(doc.data().image);
        images.push(matrix);
        labels.push(doc.data().itemLabel);
    });
    return new Compound(images, labels);
};

const transformImageData = function (imageData: object[]): number[][] {
    const matrix: number[][] = [];
    imageData.forEach((row) => {
        let matrixRow: number[] = [];
        for (let key in row) {
            if (row.hasOwnProperty(key)) {
                matrixRow.push(row[key]);
            }
        }
        matrix.push(matrixRow);
    });
    return matrix;
};

export const tensorflow = functions.https.onRequest(async (request, response) => {
    const data: Compound = await getTrainingImages();

    console.log("images shape = [" + data.images.length + ", " + data.images[0].length + ", " + data.images[0][0].length + "]");

    response.send("Hello from Firebase!");
});

