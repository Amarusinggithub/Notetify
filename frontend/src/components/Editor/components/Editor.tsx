import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import ToolbarPlugin from "../plugins/ToolbarPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";

function Placeholder() {
  return <div className="editor-placeholder">Type your note...</div>;
}

 const  Editor=()=> {
  return (
    <div className="editor-container">
      <ToolbarPlugin />
      <div className="editor-inner">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="editor-input"
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
            />
          }
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <LinkPlugin />
        <AutoFocusPlugin />
        <TablePlugin />
        <TabIndentationPlugin />
      </div>
    </div>
  );
}


export default Editor;