import * as React from "react";
import {render} from "react-dom";
import {AppContainer} from "react-hot-loader";
import App from "./components/App";
import { HashRouter } from "react-router-dom";
import "./sass/main.scss";

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
