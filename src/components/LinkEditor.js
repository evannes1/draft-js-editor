import React from 'react';
import { Editor, EditorState, RichUtils, CompositeDecorator } from "draft-js";

class LinkEditor extends React.Component {

    constructor(props) {
        super();

        const decorator=new CompositeDecorator([
            {
                strategy: this.findLinkEntities,
                component: Link,
            },
        ]);
        this.state={
            editorState: EditorState.createEmpty(decorator),
            showURLInput: false,
            urlValue: '',
        };

        //this.editor=React.createRef();
        this.url=React.createRef();

        this.setDomEditorRef=(ref) => {
            this.domEditor=ref;
        }

        this.focus=() => this.domEditor.focus();

    };

    findLinkEntities=(contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges((character) => {
            const entityKey=character.getEntity();
            return (
                entityKey!==null&&contentState.getEntity(entityKey).getType()==="LINK"
            );
        }, callback);
    };

    onChange=(editorState) => {
        console.log("IN onChange()");
        this.setState(editorState);
    };

    onURLChange=(e) => {
        this.setState({ urlValue: e.target.value });
    };


    promptForLink=(e) => {
        e.preventDefault();
        const { editorState }=this.state;
        const selection=editorState.getSelection();
        if (!selection.isCollapsed()) {
            const contentState=editorState.getCurrentContent();
            const startKey=editorState.getSelection().getStartKey();
            const startOffset=editorState.getSelection().getStartOffset();
            const blockWithLinkAtBeginning=contentState.getBlockForKey(startKey);
            const linkKey=blockWithLinkAtBeginning.getEntityAt(startOffset);

            let urlInput='';
            if (linkKey) {
                const linkInstance=contentState.getEntity(linkKey);
                urlInput=linkInstance.getData().url;
            }

            this.setState({
                showURLInput: true,
                urlValue: urlInput,
            }, () => {
                setTimeout(() => this.url.focus(), 0);
            });
        }
    };

    confirmLink=(e) => {
        e.preventDefault();
        const { editorState, urlValue }=this.state;
        const contentState=editorState.getCurrentContent();
        const contentStateWithEntity=contentState.createEntity(
            'LINK',
            'MUTABLE',
            { url: urlValue }
        );
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
        }, () => {
            setTimeout(() => this.editor.focus(), 0);
        });
    };

    onLinkInputKeyDown=(e) => {
        if (e.which===13) {
            this.confirmLink(e);
        }
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
    }

    render() {
        console.log("IN render....");
        // let urlInput='';
        if (this.state.showURLInput) {
            console.log("Will call createUrlInput");
            // urlInput=this.createUrlInput();
        }
        return (
            <div className="editorContainer">
                <div style={{ marginBottom: 10 }}>
                    Select some text, then use the buttons to add or remove links
                    on the selected text.
              </div>
                <div style={styles.buttons}>
                    <button
                        onMouseDown={this.promptForLink}
                        style={{ marginRight: 10 }}>
                        Add Link
                </button>
                    <button onMouseDown={this.removeLink}>
                        Remove Link
                </button>
                </div>

                <div className="editors" onClick={this.focus}>
                    <Editor
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        placeholder="Enter some text..."
                        ref={this.setDomEditorRef}
                    />
                </div>
            </div>
        );

    }

};   // end class

const Link=(props) => {
    const { url }=props.contentState.getEntity(props.entityKey).getData();
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
    buttons: {
        marginBottom: 10,
    },
    urlInputContainer: {
        marginBottom: 10,
    },
    urlInput: {
        fontFamily: '\'Georgia\', serif',
        marginRight: 10,
        padding: 3,
    },
    editor: {
        border: '1px solid #ccc',
        cursor: 'text',
        minHeight: 80,
        padding: 10,
    },
    button: {
        marginTop: 10,
        textAlign: 'center',
    },
    link: {
        color: '#3b5998',
        textDecoration: 'underline',
    },
};

export default LinkEditor;



