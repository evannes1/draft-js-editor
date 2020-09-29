import React from "react";
import { Editor, EditorState, RichUtils } from "draft-js";
// import Editor from "draft-js-plugins-editor";
import createHighlightPlugin from "./plugins/highlightPlugin";

const highlightPlugin=createHighlightPlugin();

class PageContainer extends React.Component {
    constructor(props) {
        super();
        this.state={
            editorState: EditorState.createEmpty()
        };
        this.plugins=[highlightPlugin];
    }

    onChange=editorState => {
        this.setState({
            editorState
        });
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

    onUnderlineClick=() => {
        this.onChange(
            RichUtils.toggleInlineStyle(this.state.editorState, "UNDERLINE")
        );
    };

    onBoldClick=() => {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, "BOLD"));
    };

    onItalicClick=() => {
        this.onChange(
            RichUtils.toggleInlineStyle(this.state.editorState, "ITALIC")
        );
    };

    onHighlight=() => {
        console.log("IN onHightlight() function");
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, "HIGHLIGHT"));
    }



    render() {
        return (
            <div className="editorContainer">
                <button onClick={this.onUnderlineClick}>U</button>
                <button onClick={this.onBoldClick}>
                    <b>B</b>
                </button>
                <button onClick={this.onItalicClick}>
                    <em>I</em>
                </button>
                <div className="editors">
                    <Editor
                        editorState={this.state.editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                    />
                </div>
            </div>
        );
    }
}

export default PageContainer;
