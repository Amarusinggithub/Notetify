import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';

function Placeholder() {
  return <div className="editor-placeholder">Type your note...</div>;
}

type EditorProps = {
  isSelected: boolean;
};
//      {isSelected && <ToolbarPlugin />}

const Editor = (isSelected: EditorProps) => {
  return (
    <div className="editor-container">
      <div className="editor-inner">
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
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
};

export default Editor;
