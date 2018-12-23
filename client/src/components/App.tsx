import * as React from "react";
import {ReactNode} from "react";
import Header from "./header/header";
import ContentArea from "./content-area/content-area";
import Nav from "./nav/nav";

export default class App extends React.Component {

    public static readonly TITLE: string = "Krownify";

    render(): ReactNode {
        return <div className="app">
            <Header title={App.TITLE} />
            <ContentArea  />
            <Nav />
        </div>;
    }
}
