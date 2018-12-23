import * as React from "react";
import {ReactNode} from "react";

export interface HeaderProps {
    title: string;
}

export default class Header extends React.Component<HeaderProps, {}> {

    render(): ReactNode {
        return <header><h1>{this.props.title}</h1></header>;
    }

}
