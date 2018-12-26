import * as React from "react";
import * as config from "react-global-configuration";
import {render} from "react-dom";
import {AppContainer} from "react-hot-loader";
import App from "./components/App";
import { HashRouter } from "react-router-dom";
import "./sass/main.scss";

config.set({
    firebaseConfig: {
        apiKey: "AIzaSyCWRoMFsmWkC0AS5Wg5Mt7DfdVlI8V2gsU",
        authDomain: "krownify.firebaseapp.com",
        databaseURL: "https://krownify.firebaseio.com",
        projectId: "krownify",
        storageBucket: "krownify.appspot.com",
        messagingSenderId: "879978171684"
    }
});
// const firebase = Firebase.initializeApp(config);

const rootEl = document.getElementById("root");

render(
    <HashRouter>
        <AppContainer>
            <App/>
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
