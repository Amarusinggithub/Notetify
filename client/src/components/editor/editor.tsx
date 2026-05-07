import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Mathematics } from '@tiptap/extension-mathematics';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorContent, Extension, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { NoteEditorProvider } from '@/context/editor-context.tsx';
import { useFetchNote, useUpdateNote } from '@/hooks/use-note.ts';
import { cn } from '@/lib/utils.ts';
import { useStore } from '@/stores/index.ts';
import { EditorHeader } from '@/components/editor/editor-header.tsx';
import EditorToolbar from '@/components/editor/editor-toolbar.tsx';
import suggestion from '@/components/shared/suggestion.tsx';

import EditorFooter from '@/components/editor/editor-footer';
import { EditorLoadingSkeleton } from './editor-loading-skeleton';

export const Editor = () => {
	const lastLoadedId = useRef<string | null>(null);
	const currentNoteId = useStore((s) => s.selectedNoteId);
	const prevNoteIdRef = useRef<string | null>(currentNoteId);
	const isMounted = useRef(false);
	const isLoadingContent = useRef(false);
	const EMPTY_NOTE = '<h1></h1>';

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	// Load KaTeX CSS dynamically — only when the editor is mounted
	useEffect(() => {
		import('katex/dist/katex.min.css');
	}, []);

	const updateNoteMutation = useUpdateNote();
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { data: currentUserNote } = useFetchNote(currentNoteId!);
	const currentUserNoteRef = useRef<typeof currentUserNote>(null);

	const editor = useEditor({
		editorProps: {
			attributes: {
				spellcheck: 'false',
				class:
					'focus:outline-none print:border-0 bg-editor text-editor-foreground border border-editor-border flex-col min-h-[1054px] w-full pt-10 pr-14 pb-10 pl-14 cursor-text',
			},
		},
		enableContentCheck: true,
		onContentError: ({ disableCollaboration }) => {
			disableCollaboration();
		},
		onCreate: () => {
			isMounted.current = true;
		},
		onDestroy: () => {
			isMounted.current = false;
		},
		// Debounced auto-save: fires on every editor content change (typing, formatting, etc.)
		onUpdate: ({ editor: currentEditor }) => {
			// Skip saves triggered by programmatic content loading (note switch)
			if (isLoadingContent.current) return;

			// Skip if ref is null (note is mid-transition between old and new)
			const note = currentUserNoteRef.current;
			if (!note) return;

			// Skip if content hasn't actually changed from what's in the database
			const html = currentEditor.getHTML();
			if (note.note.content === html) return;

			// Cancel any previously queued save to restart the debounce timer
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}

			const noteId = note.id;

			// Save after 500ms of inactivity
			saveTimeoutRef.current = setTimeout(() => {
				saveTimeoutRef.current = null;
				// Re-verify we're still on the same note before saving
				if (currentUserNoteRef.current?.id !== noteId) return;
				updateNoteMutation.mutate({
					id: noteId,
					payload: { content: html },
				});
			}, 500);
		},

		extensions: [
			StarterKit.configure({
				undoRedo: false,
				heading: {
					levels: [1, 2, 3, 4, 5],
				},
			}),
			//Color,
			Highlight,
			TitleExtension,
			FontSize,
			Mathematics.configure({
				// Options for the inline math node
				inlineOptions: {
					onClick: (node, pos) => {
						// you can do anything on click, e.g. open a dialog to edit the math node
						// or just a prompt to edit the LaTeX code for a quick prototype
						const katex = prompt('Enter new calculation:', node.attrs.latex);
						if (katex) {
							editor
								.chain()
								.setNodeSelection(pos)
								.updateInlineMath({ latex: katex })
								.focus()
								.run();
						}
					},
				},

				// Options for the block math node
				blockOptions: {
					onClick: (node, pos) => {
						// you can do anything on click, e.g. open a dialog to edit the math node
						// or just a prompt to edit the LaTeX code for a quick prototype
						const katex = prompt('Enter new calculation:', node.attrs.latex);
						if (katex) {
							editor
								.chain()
								.setNodeSelection(pos)
								.updateBlockMath({ latex: katex })
								.focus()
								.run();
						}
					},
				},

				// Options for the KaTeX renderer. See here: https://katex.org/docs/options.html
				katexOptions: {
					throwOnError: false, // don't throw an error if the LaTeX code is invalid
					macros: {
						'\\R': '\\mathbb{R}', // add a macro for the real numbers
						'\\N': '\\mathbb{N}', // add a macro for the natural numbers
					},
				},
			}),
			//Underline,
			TableKit,

			//FontFamily,
			TextAlign.configure({
				defaultAlignment: 'left',
				types: ['heading', 'paragraph'],
			}),
			TextStyle,
			FontFamily,
			Superscript,
			Subscript,

			Emoji.configure({
				emojis: gitHubEmojis,
				enableEmoticons: true,
				suggestion,
			}),
			Placeholder.configure({
				showOnlyCurrent: true,
				includeChildren: true,
				placeholder: ({ node, pos }) => {
					if (pos === 0 && node.type.name === 'heading') {
						return "What's the title?";
					}

					return 'Write your content here:';
				},
			}),
			Image,
			TaskList,
			TaskItem.configure({
				nested: true,
			}),

			Youtube.configure({
				controls: false,
				nocookie: true,
				inline: false,
				width: 480,
				height: 320,
				allowFullscreen: false,
				autoplay: true,
				ccLanguage: 'es',
				ccLoadPolicy: true,
				disableKBcontrols: true,
				enableIFrameApi: true,
				origin: 'notetify.com',
				progressBarColor: 'white',
			}),
		],
	});

	// Immediate cleanup when the selected note changes in the store.
	// Runs BEFORE the content-loading effect so the editor is in a clean
	// state and no stale saves can leak to the wrong note.
	useEffect(() => {
		if (prevNoteIdRef.current !== currentNoteId) {
			// Cancel any pending debounced save from the old note
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
				saveTimeoutRef.current = null;
			}
			prevNoteIdRef.current = currentNoteId;

			// Null the ref so onUpdate is blocked during the transition
			currentUserNoteRef.current = null;

			// Clear the editor immediately (uses <h1> to satisfy TitleExtension filter)
			if (editor) {
				isLoadingContent.current = true;
				editor.commands.setContent(EMPTY_NOTE);
				isLoadingContent.current = false;
				lastLoadedId.current = null;
			}
		}
	}, [currentNoteId, editor]);

	// Loads the note's content into the editor once the query data is available.
	// Also keeps editability and the note ref in sync.
	useEffect(() => {
		if (!editor) return;

		const noteId = currentUserNote?.id;

		// Disable editing when no note is selected or note is trashed
		editor.setEditable(Boolean(noteId && currentUserNote.is_trashed === false));

		// No note selected — reset everything
		if (!noteId) {
			currentUserNoteRef.current = null;
			isLoadingContent.current = true;
			editor.commands.setContent(EMPTY_NOTE);
			isLoadingContent.current = false;
			lastLoadedId.current = null;
			return;
		}

		// Load content only once per note (skip if already loaded)
		if (lastLoadedId.current !== noteId) {
			lastLoadedId.current = noteId;
			const dbContent = currentUserNote.note?.content || EMPTY_NOTE;
			isLoadingContent.current = true;
			editor.commands.setContent(dbContent);
			isLoadingContent.current = false;
		}

		// Only set the ref AFTER content is loaded so onUpdate always
		// sees the correct note data matching the editor content
		currentUserNoteRef.current = currentUserNote;
	}, [editor, currentUserNote?.id]);

	if (!editor) {
		return <EditorLoadingSkeleton />;
	}

	return (
		<NoteEditorProvider editor={editor}>
			<div className="bg-editor flex h-full flex-col">
				<EditorHeader currentNoteId={currentUserNote?.id} />
				<EditorToolbar />
				<div className="relative flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/40">
					<div
						className={cn(
							'h-full w-full',
							!currentUserNote &&
								'invisible absolute top-0 left-0 h-0 overflow-hidden'
						)}
					>

							<EditorContent
								editor={editor}
								className={cn(
									'bg-editor text-editor-foreground mx-auto min-h-full w-full border-0 shadow-lg'
								)}
							/>
					</div>
					{!currentUserNote && (
						<div className="text-muted-foreground flex h-full items-center justify-center text-sm">
							Select or create a note to get started.
						</div>
					)}
				</div>{' '}
				<EditorFooter />
			</div>
		</NoteEditorProvider>
	);
};

const TitleExtension = Extension.create({
	name: 'title',

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey('title'),

				filterTransaction: (transaction, state) => {
					if (!transaction.docChanged) return true;

					const firstNodeSize = state.doc.firstChild?.nodeSize ?? 0;

					// Checks each step to see if it modifies the first node
					for (const step of transaction.steps) {
						const stepMap = step.getMap();
						let touchesFirstNode = false;

						// Check if step affects positions within first node
						stepMap.forEach((oldStart, oldEnd) => {
							if (oldStart < firstNodeSize) {
								touchesFirstNode = true;
							}
						});

						// Also check step.from directly for AddMarkStep, RemoveMarkStep, etc.
						// @ts-ignore
						const from = step.from ?? step.pos ?? 0;
						// @ts-ignore
						const to = step.to ?? from;

						if (from < firstNodeSize || to < firstNodeSize) {
							touchesFirstNode = true;
						}

						if (touchesFirstNode) {
							const newFirstNode = transaction.doc.firstChild;

							// Block heading level changes
							if (
								newFirstNode &&
								(newFirstNode.type.name !== 'heading' ||
									newFirstNode.attrs.level !== 1)
							) {
								return false;
							}

							// Block mark additions (bold, italic, underline, fontSize, etc.)
							// @ts-ignore - Check if this is a mark step
							if (step.mark || step.constructor.name === 'AddMarkStep') {
								return false;
							}
						}
					}

					return true;
				},

				appendTransaction: (transactions, oldState, newState) => {
					const { doc, tr } = newState;
					const firstNode = doc.firstChild;
					let modified = false;

					if (!firstNode) return null;

					const firstNodeEnd = firstNode.nodeSize;

					// Ensure it's h1
					if (
						firstNode.type.name !== 'heading' ||
						firstNode.attrs.level !== 1
					) {
						const headingType = newState.schema.nodes.heading;
						tr.setNodeMarkup(0, headingType, { level: 1 });
						modified = true;
					}

					// Aggressively remove ALL marks from first node
					if (firstNode.content.size > 0) {
						// Position 1 is start of content inside first node, firstNodeEnd - 1 is end
						const from = 1;
						const to = firstNodeEnd - 1;

						// Get all mark types and remove them
						const markTypes = Object.values(newState.schema.marks);
						markTypes.forEach((markType) => {
							if (tr.doc.rangeHasMark(from, to, markType)) {
								tr.removeMark(from, to, markType);
								modified = true;
							}
						});
					}

					return modified ? tr : null;
				},
			}),
		];
	},
});

