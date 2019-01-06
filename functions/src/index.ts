import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import * as tf from "@tensorflow/tfjs";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Compound} from "./compound";
import {join} from "path";
import {Bucket} from "@google-cloud/storage";

const util_1 = require("util");
require("util.promisify").shim();
import "tfjs-node-save";
import {NodeFileSystem} from "tfjs-node-save/io/file_system";
import {Rank, Tensor} from "@tensorflow/tfjs-core";

// The Firebase Admin SDK to access the Firestore Database.
firebase.initializeApp();

const tmpdir = require("os").tmpdir();
const fs = require("fs");
const modelPath = join(tmpdir, "tfjs-model");

const transformImageData = function (imageData: object[]): number[][] {
    const matrix: number[][] = [];
    imageData.forEach((row) => {
        const matrixRow: number[] = [];
        for (const key in row) {
            if (row.hasOwnProperty(key)) {
                matrixRow.push(row[key]);
            }
        }
        matrix.push(matrixRow);
    });
    return matrix;
};

const getTrainingImages = async function(): Promise<Compound> {
    const images: number[][][] = [];
    const labels: number[] = [];

    const querySnapshot: firebase.firestore.QuerySnapshot = await firebase.firestore().collection("training")
        .select("image", "itemLabel")
        .get();
    querySnapshot.forEach((doc: DocumentSnapshot) => {
        const matrix = transformImageData(doc.data().image);
        images.push(matrix);
        labels.push(doc.data().itemLabel);
    });
    return new Compound(images, labels);
};

const uploadModelFiles = async function(): Promise<boolean> {

    const bucket: Bucket = firebase.storage().bucket(firebase.app().options.storageBucket);

    const tempJSONPath = join(modelPath, "model.json");
    const tempBINPath = join(modelPath, "weights.bin");

    await bucket.upload(tempJSONPath);
    console.log("Uploaded", tempJSONPath);
    await bucket.upload(tempBINPath);
    console.log("Uploaded", tempBINPath);

    fs.unlinkSync(tempJSONPath);
    fs.unlinkSync(tempBINPath);

    return true;
};

export const tensorflow = functions.https.onRequest(async (request, response) => {
    const data: Compound = await getTrainingImages();

    console.log("images shape = [" + data.images.length + ", " + data.images[0].length + ", " + data.images[0][0].length + "]");

    // Defining the model:
    const model = tf.sequential();
    model.add(tf.layers.flatten({inputShape: [28, 28]}));
    model.add(tf.layers.dense({units: 128, activation: "relu"}));
    model.add(tf.layers.dense({units: 10, activation: "softmax"}));

    // Preparing the model for training: Specify the loss and the optimizer.
    model.compile(
        {
            optimizer: "adam",
            loss: "sparseCategoricalCrossentropy",
            metrics: ["accuracy"]
        }
    );

    // @ts-ignore
    const trainImages: Tensor<Rank> = tf.tensor3d(data.images, [data.images.length, 28, 28]);
    // @ts-ignore
    const trainLabels: Tensor<Rank>  = tf.tensor1d(data.labels);

    try {
        await model.fit(trainImages, trainLabels, {epochs: 5}).then(async () => {
            console.log("Done training");

            // Saving to file system:
            const saveResult = await model.save(new NodeFileSystem(modelPath));
            console.log("saveResult = ", saveResult);
            await uploadModelFiles();
        });
        response.send("Success! Trained the model.");
    } catch (e) {
        console.error("An error occurred training the model", e);
        response.send("Error. Check the logs.");
    }
});

