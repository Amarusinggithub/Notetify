import { type Editor } from '@tiptap/react';
import React, {
	createContext,
	type PropsWithChildren,
	useContext,
	useState,
} from 'react';

interface EditorStoreContextType {
	setEditor: React.Dispatch<React.SetStateAction<Editor | null>>;
	editor: Editor | null;
}

type TagProviderProps = PropsWithChildren;

const EditorStoreContext = createContext<EditorStoreContextType | undefined>(
	undefined,
);

const EditorStoreProvider = ({ children }: TagProviderProps) => {
	const [editor, setEditor] = useState<Editor | null>(null);

	return (
		<EditorStoreContext.Provider
			value={{
				editor,
				setEditor,
			}}
		>
			{children}
		</EditorStoreContext.Provider>
	);
};

const useEditorStore = () => {
	const context = useContext(EditorStoreContext);
	if (!context) {
		throw new Error('useEditorStore  must be use within a EditorStoreProvider');
	}
	return context;
};

export default useEditorStore;
export { EditorStoreContext, EditorStoreProvider };
