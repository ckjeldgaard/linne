import * as React from "react";
import {ReactNode} from "react";
import * as ReactModal from "react-modal";
import ImageProcessing from "../image-processing/image-processing";
import {Item} from "../../model/item";

export interface UploadProps {
    firebase: firebase.app.App;
}

export interface UploadState {
    chosenFile: Blob | null;
}

ReactModal.setAppElement("#root");

export default class Upload extends React.Component<UploadProps, UploadState> {

    private fileField: any;
    private itemOptions: Item[] = [
        { "id": 0, "label": "T-shirt/top" },
        { "id": 1, "label": "Trouser" },
        { "id": 2, "label": "Pullover" },
        { "id": 3, "label": "Dress" },
        { "id": 4, "label": "Coat" },
        { "id": 5, "label": "Sandal" },
        { "id": 6, "label": "Shirt" },
        { "id": 7, "label": "Sneaker" },
        { "id": 8, "label": "Bag" },
        { "id": 9, "label": "Ankle boot" },
    ];

    constructor(props: UploadProps, state: UploadState) {
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
                {this.state.chosenFile != null && <ImageProcessing firebase={this.props.firebase} file={this.state.chosenFile} itemOptions={this.itemOptions} closeModal={this.closeModal} />}
            </ReactModal>
        </article>;
    }

}
