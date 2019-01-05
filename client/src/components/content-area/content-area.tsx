import * as React from "react";
import {ReactNode} from "react";
import {Route, Switch} from "react-router";
import Detect from "../detect/detect";
import Upload from "../upload/upload";
import Scaffolding from "../scaffolding/scaffolding";

export default class ContentArea extends React.Component {

    render(): ReactNode {
        return <Switch>
            <Route exact path="/" component={Detect} />
            <Route exact path="/upload" component={Upload} />
            <Route exact path="/stats" component={Scaffolding} />
        </Switch>;
    }

}
