import * as React from "react";
import {render} from "react-dom";
import {AppContainer} from "react-hot-loader";
import App from "./components/App";
import { HashRouter } from "react-router-dom";
import "./sass/main.scss";
import * as Firebase from "firebase/app";

const firebaseConfig: object = {
    apiKey: "AIzaSyCLBx1643KN6km_J1HCsd2unP9QLBIAF0k",
    authDomain: "ml-linne.firebaseapp.com",
    databaseURL: "https://ml-linne.firebaseio.com",
    projectId: "ml-linne",
    storageBucket: "ml-linne.appspot.com",
    messagingSenderId: "920156771754"
};
const firebase = Firebase.initializeApp(firebaseConfig, "linne");

const rootEl = document.getElementById("root");

render(
    <HashRouter>
        <AppContainer>
            <App firebase={firebase} />
        </AppContainer>
    </HashRouter>,
    rootEl
);

// Hot Module Replacement API
declare let module: { hot: any };

if (module.hot) {
    module.hot.accept("./components/App", () => {
        const NewApp = require("./components/App").default;

        render(
            <HashRouter>
                <AppContainer>
                    <NewApp/>
                </AppContainer>
            </HashRouter>,
            rootEl
        );
    });
}
