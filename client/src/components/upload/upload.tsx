import * as React from "react";
import {ReactNode} from "react";
import * as ReactModal from "react-modal";
import ImageProcessing from "../image-processing/ImageProcessing";

export interface UploadState {
    chosenFile: Blob | null;
}

ReactModal.setAppElement("#root");

export default class Upload extends React.Component<{}, UploadState> {

    private fileField: any;

    constructor(props: any, state: UploadState) {
        super(props, state);
        this.onFileChosen = this.onFileChosen.bind(this);

        this.state = {
            chosenFile: null
        };

        this.closeModal = this.closeModal.bind(this);
    }

    closeModal(): void {
        this.setState({chosenFile: null});
    }

    private onFileChosen(event: any): void {
        this.setState({chosenFile: this.fileField.files[0]});
    }

    render(): ReactNode {
        return <article className="upload">
            <input type="file" accept="image/*" capture ref={(f) => {this.fileField = f; }} onChange={this.onFileChosen} />
            <ReactModal
                isOpen={this.state.chosenFile != null}
                onRequestClose={this.closeModal}
                className="modal"
                overlayClassName="overlay">
                <span className="close" onClick={this.closeModal}>×</span>
                {this.state.chosenFile != null && <ImageProcessing file={this.state.chosenFile} />}
            </ReactModal>
        </article>;
    }

}
