import * as React from "react";
import {ReactNode} from "react";
import * as ReactModal from "react-modal";
import ImageProcessing from "../image-processing/image-processing";
import {Coin} from "../../model/coin";

export interface UploadState {
    chosenFile: Blob | null;
}

ReactModal.setAppElement("#root");

export default class Upload extends React.Component<{}, UploadState> {

    private fileField: any;
    private coinOptions: Coin[] = [
        { "id": 0, "label": "50 øre" },
        { "id": 1, "label": "1 kr." },
        { "id": 2, "label": "2 kr." },
        { "id": 3, "label": "5 kr." },
        { "id": 4, "label": "10 kr." },
        { "id": 5, "label": "20 kr." },
    ];

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
            <input type="file" accept="image/*" id="capture" className="captureInput" capture ref={(f) => {this.fileField = f; }} onChange={this.onFileChosen} />
            <label htmlFor="capture" id="capture-label">Upload new image</label>
            <ReactModal
                isOpen={this.state.chosenFile != null}
                onRequestClose={this.closeModal}
                className="modal"
                overlayClassName="overlay">
                <span className="close" onClick={this.closeModal}>×</span>
                {this.state.chosenFile != null && <ImageProcessing file={this.state.chosenFile} coinOptions={this.coinOptions} closeModal={this.closeModal} />}
            </ReactModal>
        </article>;
    }

}
