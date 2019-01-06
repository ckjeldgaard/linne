import * as React from "react";
import {ReactNode} from "react";

export interface DetectProps {
    firebase: firebase.app.App;
}

export default class Detect extends React.Component<DetectProps> {

    /* constructor() {
        super();

    } */

    render(): ReactNode {
        return <article>
            <h1>Detect</h1>
        </article>;
    }

}
