# linne

> A serverless machine learning web app for classifying images using TensorFlow.js

This is an experimental web app consisting of a web frontend written in [React](https://reactjs.org/) using multiple [Firebase](https://firebase.google.com/) services as Backend-as-a-Service (BaaS). The app is capable of classifying as well detecting different types of clothes by using the [fashion-mnist](https://github.com/zalandoresearch/fashion-mnist) dataset from Zalando.

## Architectural overview

* **Web frontend:** Responsible for uploading new classified images to the backend and detect clothes from webcam.
* **Firebase backend:** Responsible for storing classified images, continuously training a model using [TensorFlow.js](https://js.tensorflow.org/) and storing model files.
 
![Architecture diagram](https://sappy.dk/billeder/serverless-ml-architecture.png)

Diagram "step-by-step":

* **A:** User classifies and uploads a new image to Cloud Firestore. The image is cropped and processed to a 28x28 pixels grayscale image stored as a multi-dimensional array.
* **B:** The original image file is uploaded to Cloud Storage.
* **C:** Whenever executed, a cloud function will fetch all classified images from Firestore.
* **D:** The function trains a neural network model using TensorFlow.js. The model is defined as a sequential model with three layers. The approach in this step is inspired by [this Keras tutorial](https://www.tensorflow.org/tutorials/keras/basic_classification).
* **E:** The generated model files a temporarily stored in the Node.js file system and uploaded to Cloud Storage afterwards.
* **F:** The web frontend opens a webcam video stream, detects objects in each frame using a [sliding window](https://datalya.com/blog/machine-learning/object-detection-with-sliding-window-algorithm) technique, and predicts what kind of clothes are displayed in front of the webcam using the downloaded model files from Cloud Storage. Again, TensorFlow.js is used on the frontend to do predictions.

## Screenshots

