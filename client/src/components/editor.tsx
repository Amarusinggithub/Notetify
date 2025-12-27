import { useLiveblocksExtension } from '@liveblocks/react-tiptap';
import { Color } from '@tiptap/extension-color';
import DragHandle from '@tiptap/extension-drag-handle-react';
import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji';
import { FontFamily } from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Mathematics } from '@tiptap/extension-mathematics';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table'
import { TaskItem, TaskList } from '@tiptap/extension-list';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyleKit } from '@tiptap/extension-text-style'
import {
	useMutation,
	useQueryClient,
	useSuspenseInfiniteQuery,
} from '@tanstack/react-query';
import { fetchNotesPage, updateNote } from '../lib/notes';
import { cn } from '../lib/utils';
import useEditorStore from '../stores/use-editor-store';
import { useNotesStore } from '../stores/use-notes-store';
import EditorFooter from './editor-footer';
import { EditorHeader } from './editor-header';
import EditorToolbar from './editor-toolbar';
import suggestion from './suggestion';

export const Editor = () => {
	const liveblocks = useLiveblocksExtension();

	const { setEditor } = useEditorStore();
	const selectedNoteId = useNotesStore((s) => s.selectedNoteId);
	const setSelectedNote = useNotesStore((s) => s.setSelectedNote);
	const queryClient = useQueryClient();

	const { data } = useSuspenseInfiniteQuery({
		queryKey: [
			'notes',
			useNotesStore.getState().search,
			useNotesStore.getState().sortBy,
		],
		queryFn: fetchNotesPage,
		initialPageParam: 1,
		getNextPageParam: (lastPage) => lastPage.nextPage,
	});

	const allNotes = (data?.pages ?? []).flatMap((p: any) => p.results ?? []);
	const current =
		allNotes.find((n: any) => n.id === selectedNoteId) ?? allNotes[0];
	// Ensure a selection exists
	if (!selectedNoteId && current?.id) {
		setSelectedNote(current.id);
	}

	const mutation = useMutation({
		mutationFn: (content: string) => updateNote(current.id, { content }),
		onSuccess: (updated) => {
			// Update cache so readers stay in sync
			queryClient.setQueryData(
				[
					'notes',
					useNotesStore.getState().search,
					useNotesStore.getState().sortBy,
				],
				(old: any) => {
					if (!old) return old;
					const pages = old.pages.map((pg: any) => ({
						...pg,
						results: pg.results.map((u: any) =>
							u.id === updated.id ? updated : u,
						),
					}));
					return { ...old, pages };
				},
			);
		},
	});

	const editor = useEditor({
		editorProps: {
			attributes: {
				spellcheck: 'false',
				class:
					'focus:outline-none print:border-0 bg-editor text-editor-foreground border border-editor-border flex-col min-h-[1054px] w-full pt-10 pr-14 pb-10 pl-14 cursor-text',
			},
		},
		enableContentCheck: true,
		onContentError: ({ disableCollaboration, editor: currentEditor }) => {
			disableCollaboration();
			setEditor(currentEditor);
		},
		onCreate: ({ editor: currentEditor }) => {
			setEditor(currentEditor);
		},
		onDestroy: () => {
			setEditor(null);
		},
		onUpdate: ({ editor: currentEditor }) => {
			setEditor(currentEditor);
			// Debounced auto-save
			if (current) {
				if ((window as any).__ntf_saveTimer) {
					clearTimeout((window as any).__ntf_saveTimer);
				}
				(window as any).__ntf_saveTimer = setTimeout(() => {
					const html = currentEditor.getHTML();
					mutation.mutate(html);
				}, 600);
			}
		},
		onSelectionUpdate: ({ editor: currentEditor }) => {
			setEditor(currentEditor);
		},
		onTransaction: ({ editor: currentEditor }) => {
			setEditor(currentEditor);
		},
		onFocus: ({ editor: currentEditor }) => {
			setEditor(currentEditor);
		},
		onBlur: ({ editor: currentEditor }) => {
			setEditor(currentEditor);
		},

		extensions: [
			liveblocks,
			StarterKit,
			Color,
			Highlight,
			Mathematics.configure({
				shouldRender: (state, pos, node) => {
					const $pos = state.doc.resolve(pos);
					return (
						node.type.name === 'text' && $pos.parent.type.name !== 'codeBlock'
					);
				},
			}),
			Underline,
			Table.configure({
				resizable: true,
			}),

			FontFamily,
			TextAlign.configure({
				defaultAlignment: 'left',
				types: ['heading', 'paragraph'],
			}),
			TextStyleKit.configure({
				backgroundColor: {
					types: ['textStyle'],
				},
				color: {
					types: ['textStyle'],
				},
				fontFamily: {
					types: ['textStyle'],
				},
				fontSize: {
					types: ['textStyle'],
				},
				lineHeight: {
					types: ['textStyle'],
				},
			}),
			Superscript,
			Subscript,

			Emoji.configure({
				emojis: gitHubEmojis,
				enableEmoticons: true,
				suggestion,
			}),
			Placeholder.configure({
				// Use a placeholder:
				placeholder: 'Write something …',
				// Use different placeholders depending on the node type:
				// placeholder: ({ node }) => {
				//   if (node.type.name === 'heading') {
				//     return 'What’s the title?'
				//   }

				//   return 'Can you add some further context?'
				// },
			}),
			Image,
			TaskList,
			TaskItem.configure({
				nested: true,
			}),

			Link.configure({
				openOnClick: false,
				autolink: true,
				defaultProtocol: 'https',
				protocols: ['http', 'https'],
				isAllowedUri: (url, ctx) => {
					try {
						const parsedUrl = url.includes(':')
							? new URL(url)
							: new URL(`${ctx.defaultProtocol}://${url}`);

						if (!ctx.defaultValidate(parsedUrl.href)) {
							return false;
						}

						const disallowedProtocols = ['ftp', 'file', 'mailto'];
						const protocol = parsedUrl.protocol.replace(':', '');

						if (disallowedProtocols.includes(protocol)) {
							return false;
						}

						const allowedProtocols = ctx.protocols.map((p) =>
							typeof p === 'string' ? p : p.scheme,
						);

						if (!allowedProtocols.includes(protocol)) {
							return false;
						}

						const disallowedDomains = [
							'example-phishing.com',
							'malicious-site.net',
						];
						const domain = parsedUrl.hostname;

						if (disallowedDomains.includes(domain)) {
							return false;
						}

						return true;
					} catch {
						return false;
					}
				},
				shouldAutoLink: (url) => {
					try {
						const parsedUrl = url.includes(':')
							? new URL(url)
							: new URL(`https://${url}`);

						const disallowedDomains = [
							'example-no-autolink.com',
							'another-no-autolink.com',
						];
						const domain = parsedUrl.hostname;

						return !disallowedDomains.includes(domain);
					} catch {
						return false;
					}
				},
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
				origin: 'yourdomain.com',
				progressBarColor: 'white',
			}),
		],
	});

	if (!editor) {
		return (
			<div className="bg-editor text-editor-foreground flex h-screen items-center justify-center">
				<div className="text-lg">Loading editor...</div>
			</div>
		);
	}

	// Keep editor content in sync with selected note
	if (current?.note?.content && editor.getHTML() !== current.note.content) {
		editor.commands.setContent(current.note.content);
	}

	/* const toggleEditable = () => {
				editor.setEditable(!editor.isEditable);
				editor.view.dispatch(editor.view.state.tr);
			};*/

	return (
		<div className="bg-editor flex h-screen flex-col">
			<EditorHeader />
			<EditorToolbar />
			{/*<div>
				<button onClick={toggleEditable}>Toggle editable</button>
			</div>*/}
			<div className="flex-1 overflow-auto">
				<DragHandle editor={editor}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 9h16.5m-16.5 6.75h16.5"
						/>
					</svg>
				</DragHandle>
				<EditorContent
					editor={editor}
					className={cn(
						'bg-editor text-editor-foreground mx-auto h-full min-h-full w-full border-0 shadow-lg',
					)}
				/>
			</div>
			<EditorFooter />
		</div>
	);
};
