// src/Tiptap.tsx
import CharacterCount from '@tiptap/extension-character-count'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import { EditorContent, useEditor } from '@tiptap/react'
import React, { useCallback, useEffect, useState } from 'react'



const appId = '7j9y6m10'
const room = `room.${new Date()
  .getFullYear()
  .toString()
  .slice(-2)}${new Date().getMonth() + 1}${new Date().getDate()}-ok`

// ydoc and provider for Editor A
const ydoc = new Y.Doc()
const provider = new TiptapCollabProvider({
  appId,
  name: room,
  document: ydoc,
})





const content = "<p>Hello World!</p>";

const Tiptap = () => {
    // define your extension array
const extensions = [
  Document,
  Paragraph,
  Text,
  StarterKit.configure({
    history: false,
  }),
  Highlight,

  CharacterCount.extend().configure({
    limit: 10000,
  }),
  Collaboration.extend().configure({
    document: ydoc,
  }),
  CollaborationCursor.extend().configure({
    provider,
  }),
];
  const editor = useEditor({
    extensions,
    content,
  });

  return (
    <>
      <EditorContent editor={editor} />
      
    </>
  );
};

export default Tiptap;
