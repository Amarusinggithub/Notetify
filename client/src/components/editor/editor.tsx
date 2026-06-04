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
import { useEffect, useRef, useState } from 'react';
import { NoteEditorProvider } from '@/context/editor-context.tsx';
import { useFetchNote } from '@/hooks/use-note.ts';
import { cn } from '@/lib/utils.ts';
import type { User } from '@/types';
import { useStore } from '@/store/index.ts';
import { EditorHeader } from '@/components/editor/editor-header.tsx';
import EditorToolbar from '@/components/editor/editor-toolbar.tsx';
import suggestion from '@/components/shared/suggestion.tsx';
import EditorFooter from '@/components/editor/editor-footer';
import { EditorLoadingSkeleton } from './editor-loading-skeleton';
import { HocuspocusProvider } from '@hocuspocus/provider';
import Collaboration from '@tiptap/extension-collaboration';
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret';
import * as Y from 'yjs';
import { getCollabSession } from '@/services/collab-service';
import { getCurrentUser } from '@/utils/helpers';

// ─── TitleExtension ───────────────────────────────────────────────────────────

const TitleExtension = Extension.create({
	name: 'title',

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey('title'),

				filterTransaction: (transaction, state) => {
					if (!transaction.docChanged) return true;

					const firstNodeSize = state.doc.firstChild?.nodeSize ?? 0;

					for (const step of transaction.steps) {
						const stepMap = step.getMap();
						let touchesFirstNode = false;

						stepMap.forEach((oldStart, __oldEnd) => {
							if (oldStart < firstNodeSize) {
								touchesFirstNode = true;
							}
						});

						// @ts-ignore
						const from = step.from ?? step.pos ?? 0;
						// @ts-ignore
						const to = step.to ?? from;

						if (from < firstNodeSize || to < firstNodeSize) {
							touchesFirstNode = true;
						}

						if (touchesFirstNode) {
							const newFirstNode = transaction.doc.firstChild;

							if (
								newFirstNode &&
								(newFirstNode.type.name !== 'heading' ||
									newFirstNode.attrs.level !== 1)
							) {
								return false;
							}

							// @ts-ignore
							if (step.mark || step.constructor.name === 'AddMarkStep') {
								return false;
							}
						}
					}

					return true;
				},

				appendTransaction: (__transactions, __oldState, newState) => {
					const { doc, tr } = newState;
					const firstNode = doc.firstChild;
					let modified = false;

					if (!firstNode) return null;

					const firstNodeEnd = firstNode.nodeSize;

					if (
						firstNode.type.name !== 'heading' ||
						firstNode.attrs.level !== 1
					) {
						const headingType = newState.schema.nodes.heading;
						tr.setNodeMarkup(0, headingType, { level: 1 });
						modified = true;
					}

					if (firstNode.content.size > 0) {
						const from = 1;
						const to = firstNodeEnd - 1;
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

// Types

interface CollabState {
	ydoc: Y.Doc;
	provider: HocuspocusProvider;
}

//  Editor (outer shell: manages collab session lifecycle)

export const Editor = () => {
	const currentNoteId = useStore((s) => s.selectedNoteId);
	const currentUser = useStore((s) => s.sharedData?.auth.user);
	const [collabState, setCollabState] = useState<CollabState | null>(null);
	const [collabError, setCollabError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);
	const providerRef = useRef<HocuspocusProvider | null>(null);

	useEffect(() => {
		providerRef.current?.destroy();
		providerRef.current = null;
		setCollabState(null);
		setCollabError(null);

		if (!currentNoteId) return;

		let cancelled = false;
		getCollabSession(currentNoteId)
			.then(({ token, wsUrl, docId }) => {
				if (cancelled) return;
				const ydoc = new Y.Doc();
				const provider = new HocuspocusProvider({
					url: wsUrl,
					name: docId,
					token,
					document: ydoc,
					onSynced: () => {
						if (!cancelled) setCollabState({ ydoc, provider });
					},
					onAuthenticationFailed: () => {
						if (!cancelled)
							setCollabError(
								'Authentication failed. Check your collab server configuration.'
							);
					},
					onClose: ({ event }) => {
						if (cancelled) return;
						// code 1000 = normal close (e.g. navigating away); anything else is unexpected
						if (event.code !== 1000) {
							setCollabError('Lost connection to the collaboration server.');
						}
					},
				});
				providerRef.current = provider;
			})
			.catch(() => {
				if (cancelled) return;
				setCollabError(
					'Failed to reach the API. Check that the server is running.'
				);
			});

		return () => {
			cancelled = true;
		};
	}, [currentNoteId, retryCount]);

	// Destroy provider on unmount
	useEffect(
		() => () => {
			providerRef.current?.destroy();
		},
		[]
	);

	if (currentNoteId && collabError) {
		return (
			<div className="bg-editor flex h-full flex-col items-center justify-center gap-2">
				<p className="text-muted-foreground text-sm">{collabError}</p>
				<button
					className="text-sm underline"
					onClick={() => setRetryCount((c) => c + 1)}
				>
					Retry
				</button>
			</div>
		);
	}

	if (currentNoteId && !collabState) {
		return <EditorLoadingSkeleton />;
	}

	if (!currentNoteId) {
		return (
			<div className="bg-editor flex h-full flex-col">
				<div className="scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/40 relative flex-1 scrollbar-thin scrollbar-track-transparent overflow-auto">
					<div className="text-muted-foreground flex h-full items-center justify-center text-sm">
						Select or create a note to get started.
					</div>
				</div>
			</div>
		);
	}

	return (
		<EditorInner
			key={currentNoteId}
			collabState={collabState!}
			currentUser={currentUser}
		/>
	);
};

// ─── EditorInner (tiptap editor, keyed per note) ──────────────────────────────

interface EditorInnerProps {
	collabState: CollabState;
	currentUser: User | undefined;
}

const EditorInner = ({ collabState, currentUser }: EditorInnerProps) => {
	const currentNoteId = useStore((s) => s.selectedNoteId);

	// Load KaTeX CSS dynamically — only when the editor is mounted
	useEffect(() => {
		import('katex/dist/katex.min.css');
	}, []);

	// Metadata only — body content comes from the Y.Doc via Hocuspocus
	const { data: currentUserNote } = useFetchNote(currentNoteId!);

	const editor = useEditor({
		editorProps: {
			attributes: {
				spellcheck: 'false',
				class:
					'focus:outline-none print:border-0 bg-editor text-editor-foreground border border-editor-border flex-col min-h-[1054px] w-full pt-10 pr-14 pb-10 pl-14 cursor-text',
			},
		},
		enableContentCheck: false,
		editable: false,

		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3, 4, 5],
				},
				undoRedo: false,
			}),
			Collaboration.configure({ document: collabState.ydoc }),
			CollaborationCaret.configure({
				provider: collabState.provider,
				user: getCurrentUser(
					currentUser?.full_name ?? 'Anonymous',
					currentUser?.id ?? ''
				),
			}),
			Highlight,
			TitleExtension,
			FontSize,
			Mathematics.configure({
				inlineOptions: {
					onClick: (node, pos) => {
						const katex = prompt('Enter new calculation:', node.attrs.latex);
						if (katex) {
							editor
								?.chain()
								.setNodeSelection(pos)
								.updateInlineMath({ latex: katex })
								.focus()
								.run();
						}
					},
				},
				blockOptions: {
					onClick: (node, pos) => {
						const katex = prompt('Enter new calculation:', node.attrs.latex);
						if (katex) {
							editor
								?.chain()
								.setNodeSelection(pos)
								.updateBlockMath({ latex: katex })
								.focus()
								.run();
						}
					},
				},
				katexOptions: {
					throwOnError: false,
					macros: {
						'\\R': '\\mathbb{R}',
						'\\N': '\\mathbb{N}',
					},
				},
			}),
			TableKit,
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

	// Sync editable state with note metadata — body content is owned by the Y.Doc
	useEffect(() => {
		if (!editor) return;
		editor.setEditable(
			Boolean(currentUserNote?.id && currentUserNote.is_trashed === false)
		);
	}, [editor, currentUserNote?.id, currentUserNote?.is_trashed]);

	if (!editor) {
		return <EditorLoadingSkeleton />;
	}

	return (
		<NoteEditorProvider editor={editor}>
			<div className="bg-editor flex h-full flex-col">
				<EditorHeader currentNoteId={currentUserNote?.id} />
				{currentUserNote?.is_trashed === false && <EditorToolbar />}
				<div className="scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/40 relative flex-1 scrollbar-thin scrollbar-track-transparent overflow-auto">
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
