import * as React from "react";
import {ReactNode} from "react";
import Header from "./header/header";
import ContentArea from "./content-area/content-area";
import Nav from "./nav/nav";
import {MenuItem} from "../model/menuitem";

export default class App extends React.Component {

    public static readonly TITLE: string = "Linné";

    private static menu(): MenuItem[] {
        const items: MenuItem[] = [];
        items.push({label: "Detect", className: "detect", path: "/"});
        items.push({label: "Upload", className: "upload", path: "/upload"});
        items.push({label: "Stats", className: "stats", path: "/stats"});
        items.push({label: "User", className: "user", path: "/user"});
        return items;
    }

    render(): ReactNode {
        return <div className="app">
            <Header title={App.TITLE} />
            <ContentArea  />
            <Nav menuItems={App.menu()} />
        </div>;
    }
}
