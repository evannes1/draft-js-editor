import React from "react";
import { Editor, EditorState, RichUtils, CompositeDecorator } from "draft-js";


class LinkEditorTest extends React.Component {

    constructor(props) {
        super();


        const decorator=new CompositeDecorator([
            {
                strategy: this.findLinkEntities,
                component: Link,
            },
        ]);
        this.state={
            editorState: EditorState.createEmpty(decorator)
        };
        this.url=React.createRef();

    };

    findLinkEntities=(contentBlock, callback, contentState) => {
        console.log("IN findLinkEntities...");
        contentBlock.findEntityRanges((character) => {
            const entityKey=character.getEntity();
            const haveLink=entityKey!==null&&contentState.getEntity(entityKey).getType()==="LINK";
            console.log("Have link: ", haveLink);
            return (
                entityKey!==null&&contentState.getEntity(entityKey).getType()==="LINK"
            );
        }, callback);
    };

    onChange=editorState => {
        this.setState({
            editorState
        });
    };

    onURLChange=(e) => {
        this.setState({ urlValue: e.target.value });
    };

    handleKeyCommand=(command, editorState) => {
        console.log("IN PageContainer.handleKeyCommand with command: ", command);
        const newState=RichUtils.handleKeyCommand(
            editorState,
            command
        );
        if (newState) {
            console.log("Will call this.onChange()");
            this.onChange(newState);
            return "handled";
        }
        return "not-handled";
    };

    removeLink=(e) => {
        e.preventDefault();
        const { editorState }=this.state;
        const selection=editorState.getSelection();
        if (!selection.isCollapsed()) {
            this.setState({
                editorState: RichUtils.toggleLink(editorState, selection, null),
            });
        }
    };

    promptForLink=(e) => {
        e.preventDefault();
        console.log("IN promptForLink....");
        const { editorState }=this.state;
        const selection=editorState.getSelection();
        if (!selection.isCollapsed()) {
            console.log("Selection is not collapsed...");
            const contentState=editorState.getCurrentContent();
            const startKey=editorState.getSelection().getStartKey();
            const startOffset=editorState.getSelection().getStartOffset();
            const blockWithLinkAtBeginning=contentState.getBlockForKey(startKey);
            const linkKey=blockWithLinkAtBeginning.getEntityAt(startOffset);

            let urlInput='';
            if (linkKey) {
                console.log("Have a link key...");
                const linkInstance=contentState.getEntity(linkKey);
                urlInput=linkInstance.getData().url;
                console.log("URL input: ", urlInput);
            }

            console.log("Calling setState with urlValue: ", urlInput);
            this.setState({
                showURLInput: true,
                urlValue: urlInput,
            });
            console.log("Show URL input now true...");
        }
    };

    onLinkInputKeyDown=(e) => {
        console.log("IN onLinkInputKeyDown...");
        if (e.which===13) {
            // User hit the enter key
            console.log("Will call confirmLink");
            this.confirmLink(e);
        }
    };

    confirmLink=(e) => {
        e.preventDefault();
        const { editorState, urlValue }=this.state;
        console.log("IN confirmLink, with url: ", urlValue);

        const contentState=editorState.getCurrentContent();

        // Create the link entity
        const contentStateWithEntity=contentState.createEntity(
            'LINK',
            'MUTABLE',
            { url: urlValue }
        );
        // Retrieve the key of the entity just created
        const entityKey=contentStateWithEntity.getLastCreatedEntityKey();

        const newEditorState=EditorState.set(editorState, { currentContent: contentStateWithEntity });
        this.setState({
            editorState: RichUtils.toggleLink(
                newEditorState,
                newEditorState.getSelection(),
                entityKey
            ),
            showURLInput: false,
            urlValue: '',
        });
    };

    createUrlInput=() => {
        const urlInput=
            <div style={styles.urlInputContainer}>
                <input
                    onChange={this.onURLChange}
                    ref={this.url}
                    style={styles.urlInput}
                    type="text"
                    value={this.state.urlValue}
                    onKeyDown={this.onLinkInputKeyDown}
                />
                <button onMouseDown={this.confirmLink}>
                    Confirm
                </button>
            </div>;
        return urlInput;
    };

    focus=() => this.editor.focus();

    render() {

        let urlInput='';
        if (this.state.showURLInput) {
            console.log("IN render...Will call createUrlInput");
            urlInput=this.createUrlInput();
        }
        return (
            <div className="editorContainer">
                <div style={{ marginBottom: 10 }}>
                    Select some text, then use the buttons to add or remove links
                    on the selected text.
                </div>
                <div>
                    <button
                        onMouseDown={this.promptForLink}
                        style={{ marginRight: 10 }}>
                        Add Link
                    </button>
                    <button onMouseDown={this.removeLink}>
                        Remove Link
                    </button>
                </div>
                {urlInput}
                <div style={styles.editor}>
                    <Editor
                        editorState={this.state.editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                        ref={(element) => { this.editor=element; }}
                    />
                </div>
            </div>
        );
    };

}

const Link=(props) => {
    const { url }=props.contentState.getEntity(props.entityKey).getData();
    console.log("IN Link, url: ", url);

    return (
        <a href={url} style={styles.link}>
            {props.children}
        </a>
    );

};

const styles={
    root: {
        fontFamily: '\'Georgia\', serif',
        padding: 20,
        width: 600,
        textAlign: 'left',
    },
    editor: {
        border: '1px solid #ccc',
        cursor: 'text',
        minHeight: 40,
        marginTop: 5,
        padding: 10,
        textAlign: 'left',
    },
    urlInputContainer: {
        marginTop: 5,
        marginBottom: 10,
    },
    urlInput: {
        fontFamily: '\'Georgia\', serif',
        marginRight: 10,
        padding: 3,
    },
    link: {
        color: 'blue',
        textDecoration: 'underline',
        cursor: 'pointer',
    }
};

export default LinkEditorTest;