import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";

// The Firebase Admin SDK to access the Firestore Database.
firebase.initializeApp();

const getTrainingImages = async function(): Promise<void> {

    const querySnapshot: firebase.firestore.QuerySnapshot = await firebase.firestore().collection("training").limit(2).get();
    querySnapshot.forEach((doc: DocumentSnapshot) => {
        console.log("Got doc with ID = ", doc.id);
    });

};

export const tensorflow = functions.https.onRequest(async (request, response) => {
    await getTrainingImages();

    response.send("Hello from Firebase/tensorflow!");
});

