import { useLiveblocksExtension } from '@liveblocks/react-tiptap';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import DragHandle from '@tiptap/extension-drag-handle-react';
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
import { TextStyle } from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '../lib/utils';
import { useStore } from '../stores/index.ts';
import type { PaginatedNotesResponse, UserNote } from '../types';
import { useUpdateNote } from '../hooks/use-mutate-note.tsx';
import { useEffect, useRef } from 'react';
import { NoteEditorProvider } from '../context/editor-context.tsx';
import EditorFooter from './editor-footer';
import { EditorHeader } from './editor-header';
import { Threads } from './editor-threads';
import EditorToolbar from './editor-toolbar';
import suggestion from './suggestion';
import { noteQueryKeys } from '../utils/queryKeys.ts';

export const Editor = () => {
	const queryClient = useQueryClient();
	const liveblocks = useLiveblocksExtension();
	const isMounted = useRef(false);
	const lastLoadedId = useRef<string | null>(null);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const updateNoteMutation = useUpdateNote();
	const selectedNoteId = useStore((s) => s.selectedNoteId);
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const search = useStore((s) => s.searchNotes);
	const sortBy = useStore((s) => s.sortNotesBy);

	const paginatedNotes =
		queryClient.getQueryData<InfiniteData<PaginatedNotesResponse>>(
			noteQueryKeys.list(search, sortBy )
		);

	const allNotes = paginatedNotes?.pages.flatMap((page) => page.results) ?? [];

	const currentUserNote =
		allNotes.find((n: UserNote) => n.id === selectedNoteId) ?? allNotes[-1];

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
		onUpdate: ({ editor: currentEditor }) => {
			// Debounced auto-save
			if (currentUserNote) {
				//Clear the previous timer if it exists
				if (saveTimeoutRef.current) {
					clearTimeout(saveTimeoutRef.current);
				}

				//Set the new timer
				saveTimeoutRef.current = setTimeout(() => {
					const html = currentEditor.getHTML();

					updateNoteMutation.mutate({
						id: currentUserNote.id,
						payload: { content: html },
					});
				}, 600);
			}
		},

		extensions: [
			liveblocks,
			StarterKit.configure({
				undoRedo: false,
				heading: {
					levels: [1, 2, 3, 4, 5],
				},
			}),
			//Color,
			Highlight,
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

				placeholder: ({ node }) => {
				if (node.type.name === 'heading') {
				return 'What’s the title?'
				}

				return 'Can you add some further context?'
				},
			}),
			Image,
			TaskList,
			TaskItem.configure({
				nested: true,
			}),

			/*Link.configure({
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
			}),*/
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

	useEffect(() => {
		if (!editor) return;

		const noteId = currentUserNote?.id;
		editor.setEditable(Boolean(noteId));

		if (!noteId) {
			editor.commands.clearContent(true);
			lastLoadedId.current = null;
			return;
		}

		if (lastLoadedId.current !== noteId) {
			lastLoadedId.current = noteId;
			const currentContent = currentUserNote.note?.content ?? '';
			editor.commands.setContent(currentContent);
		}
	}, [editor, currentUserNote?.id]);

	if (!editor) {
		return (
			<div className="bg-editor text-editor-foreground flex h-screen items-center justify-center">
				<div className="text-lg">Loading editor...</div>
			</div>
		);
	}

	return (
		<NoteEditorProvider editor={editor}>
			<div className="bg-editor flex h-full flex-col">
				<EditorHeader />
				<EditorToolbar />
				<div className="relative flex-1 overflow-auto">
					<div
						className={cn(
							'h-full w-full',
							!currentUserNote &&
								'invisible absolute top-0 left-0 h-0 overflow-hidden',
						)}
					>
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
						<div className="relative h-full">
							<EditorContent
								editor={editor}
								className={cn(
									'bg-editor text-editor-foreground mx-auto h-full min-h-full w-full overflow-hidden border-0 shadow-lg',
								)}
							/>
							{currentUserNote && <Threads />}
						</div>{' '}
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
