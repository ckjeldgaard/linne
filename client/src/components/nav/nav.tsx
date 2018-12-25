import * as React from "react";
import {ReactNode} from "react";
import {MenuItem} from "../../model/menuitem";
import {Link, Route} from "react-router-dom";

export interface NavProps {
    menuItems: MenuItem[];
}

export default class Nav extends React.Component<NavProps> {

    render(): ReactNode {
        return <nav>
            <ul>
                <Route render={(props) => {
                    return this.props.menuItems.map((item) => {
                        const active = (props.location.pathname === item.path) ? "active" : "";
                        // const classes = `${item.className} ${active}`;
                        return <li key={item.className}>
                            <Link to={item.path} className={`${item.className} ${active}`}>{item.label}</Link>
                        </li>;
                    });
                }} />
            </ul>
        </nav>;
    }
}
