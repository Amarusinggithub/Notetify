/* eslint-disable react/prop-types */
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import React from "react";
import { Provider } from "@lexical/yjs";

import { WebsocketProvider } from "y-websocket";
import { useEffect, useCallback, useRef } from "react";

import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LinkNode } from "@lexical/link";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";


import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";

import Toolbars from "./Toolbar.jsx";
import "../styles/NoteContentEditor.css";

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
    h6: "editor-heading-h6",
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    listitem: "editor-listItem",
    listitemChecked: "editor-listItemChecked",
    listitemUnchecked: "editor-listItemUnchecked",
  },
  hashtag: "editor-hashtag",
  image: "editor-image",
  link: "editor-link",
  text: {
    bold: "editor-textBold",
    code: "editor-textCode",
    italic: "editor-textItalic",
    strikethrough: "editor-textStrikethrough",
    subscript: "editor-textSubscript",
    superscript: "editor-textSuperscript",
    underline: "editor-textUnderline",
    underlineStrikethrough: "editor-textUnderlineStrikethrough",
  },
  code: "editor-code",
  codeHighlight: {
    atrule: "editor-tokenAttr",
    attr: "editor-tokenAttr",
    boolean: "editor-tokenProperty",
    builtin: "editor-tokenSelector",
    cdata: "editor-tokenComment",
    char: "editor-tokenSelector",
    class: "editor-tokenFunction",
    "class-name": "editor-tokenFunction",
    comment: "editor-tokenComment",
    constant: "editor-tokenProperty",
    deleted: "editor-tokenProperty",
    doctype: "editor-tokenComment",
    entity: "editor-tokenOperator",
    function: "editor-tokenFunction",
    important: "editor-tokenVariable",
    inserted: "editor-tokenSelector",
    keyword: "editor-tokenAttr",
    namespace: "editor-tokenVariable",
    number: "editor-tokenProperty",
    operator: "editor-tokenOperator",
    prolog: "editor-tokenComment",
    property: "editor-tokenProperty",
    punctuation: "editor-tokenPunctuation",
    regex: "editor-tokenVariable",
    selector: "editor-tokenSelector",
    string: "editor-tokenSelector",
    symbol: "editor-tokenProperty",
    tag: "editor-tokenProperty",
    url: "editor-tokenOperator",
    variable: "editor-tokenVariable",
  },
};

function onError(error) {
  console.error(error);

}

// fallback default state
const defaultEditorState = JSON.stringify({
  root: {
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: "Type something...",
            detail: 0,
            format: "",
            mode: "normal",
            style: "",
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

// Recursively traverse the editor state and ensure valid indent values for list items.
function sanitizeEditorState(editorStateObj) {
  function traverse(node) {
    if (node.type === "listitem") {
      if (typeof node.indent !== "number" || node.indent < 0) {
        console.warn(
          "Invalid indent value detected; resetting to 0 for node:",
          node
        );
        node.indent = 0;
      }
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child) => traverse(child));
    }
  }
  if (editorStateObj && editorStateObj.root) {
    traverse(editorStateObj.root);
  }
  return editorStateObj;
}

// Parse the incoming state or fallback to default, then sanitize.
function parseOrDefault(editorStateStr) {
  try {
    if (!editorStateStr || editorStateStr.trim() === "") {
      console.warn("Editor state is empty. Using default editor state.");
      return defaultEditorState;
    }
    const parsed = JSON.parse(editorStateStr);
    const sanitized = sanitizeEditorState(parsed);
    console.log("Sanitized editor state:", sanitized);
    // Check if the sanitized state has at least one child node:
    if (
      !sanitized.root ||
      !sanitized.root.children ||
      sanitized.root.children.length === 0
    ) {
      console.warn(
        "Sanitized editor state is empty. Using default editor state."
      );
      return defaultEditorState;
    }
    return JSON.stringify(sanitized);
  } catch (error) {
    console.error("Failed to parse editor state. Using default state.", error);
    return defaultEditorState;
  }
}

const NoteContentEditor = ({
  handleContentInput,
  content,
  isSelected,
}) => {
  const editorRef = useRef(null);
  const validContent = parseOrDefault(content);

  
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
    editable: isSelected,
    editorState: validContent,
  };


  function getDocFromMap(id, yjsDocMap) {
    if (!yjsDocMap.has(id)) {
      yjsDocMap.set(id, new Y.Doc());
    }
    return yjsDocMap.get(id);
  }

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      const doc = getDocFromMap(id, yjsDocMap);
      return new WebsocketProvider("ws://localhost:1234", id, doc, {
        connect: false,
      }) as unknown as Provider;
    },
    []
  );

  function handleOnEditorChange(editorState) {
    const editorStateJSON = editorState.toJSON();
    handleContentInput(JSON.stringify(editorStateJSON));
  }

  return (
    <LexicalComposer initialConfig={initialConfig} key={isSelected}>
      <Toolbars />
      <RichTextPlugin
        contentEditable={<ContentEditable className="content-editable" />}
        placeholder={
          <div className="editor-placeholder">Type your note...</div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <CollaborationPlugin
        id="lexical/react-rich-collab"
        providerFactory={providerFactory}
        // Optional initial editor state in case collaborative Y.Doc won't
        // have any existing data on server. Then it'll user this value to populate editor.
        // It accepts same type of values as LexicalComposer editorState
        // prop (json string, state object, or a function)
        initialEditorState={validContent}
        shouldBootstrap={true}
      />
      <OnChangePlugin onChange={handleOnEditorChange} />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <AutoFocusPlugin />
      <TablePlugin />
      <TabIndentationPlugin />
      <EditorRefPlugin editorRef={editorRef} />
    </LexicalComposer>
  );
};

export default NoteContentEditor;
