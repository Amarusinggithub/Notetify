import type { Editor } from '@tiptap/react';
import { create } from 'zustand';

type EditorState = {
  editor: Editor | null;
  setEditor: (e: Editor | null) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  editor: null,
  setEditor: (e) => set({ editor: e }),
}));

export default useEditorStore;

