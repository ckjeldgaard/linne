import * as React from "react";
import {ReactNode} from "react";
import {Route, Switch} from "react-router";
import Detect from "../detect/detect";
import Upload from "../upload/upload";

export interface ContentAreaProps {
    firebase: firebase.app.App;
}

export default class ContentArea extends React.Component<ContentAreaProps> {

    render(): ReactNode {
        return <Switch>
            <Route exact path="/" render={() => <Detect firebase={this.props.firebase} />} />
            <Route exact path="/upload" render={() => <Upload firebase={this.props.firebase} />}/>
        </Switch>;
    }

}
