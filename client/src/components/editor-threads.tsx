import {
	AnchoredThreads,
	FloatingComposer,
	FloatingThreads,
} from '@liveblocks/react-tiptap';
import { useThreads } from '@liveblocks/react/suspense';
import { useNoteEditor } from '../context/editor-context';

export function Threads() {
	const editor = useNoteEditor();

	const { threads } = useThreads({ query: { resolved: false } });

	return (
		<>
			<div className="anchored-threads">
				<AnchoredThreads editor={editor} threads={threads} />
			</div>
			<FloatingThreads
				editor={editor}
				threads={threads}
				className="floating-threads"
			/>
			<FloatingComposer editor={editor} className="floating-composer" />
		</>
	);
}
