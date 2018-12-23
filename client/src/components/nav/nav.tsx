import * as React from "react";
import {ReactNode} from "react";

export default class Nav extends React.Component {

    render(): ReactNode {
        return <nav>
            <ul>
                <li><a className="detect" href="#">Detect</a></li>
                <li><a className="upload" href="#">Upload</a></li>
                <li><a className="stats" href="#">Stats</a></li>
                <li><a className="user" href="#">User</a></li>
            </ul>
        </nav>;
    }

}
