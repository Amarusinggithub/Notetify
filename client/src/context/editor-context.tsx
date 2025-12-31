import { Editor } from '@tiptap/react';
import { createContext, useContext } from 'react';

const EditorContext = createContext<Editor | null>(null);

export const useNoteEditor = () => useContext(EditorContext);

export const NoteEditorProvider = ({
	editor,
	children,
}: {
	editor: Editor | null;
	children: React.ReactNode;
}) => {
	return (
		<EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
	);
};
