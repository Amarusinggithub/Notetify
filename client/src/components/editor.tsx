import { useLiveblocksExtension } from '@liveblocks/react-tiptap';
import {
	useMutation,
	useQueryClient,
	useSuspenseInfiniteQuery,
} from '@tanstack/react-query';
import DragHandle from '@tiptap/extension-drag-handle-react';
import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Mathematics } from '@tiptap/extension-mathematics';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { PaginatedNotesResponse } from '../components/app-notes-sidebar.tsx';
import { cn } from '../lib/utils';
import { fetchNotesPage, updateNote } from '../services/note-service.ts';
import { useStore } from '../stores/index.ts';
import type { UserNote } from '../types';

import { useEffect, useMemo } from 'react';
import { useRouteLoaderData } from 'react-router';
import { NoteEditorProvider } from '../context/editor-context.tsx';
import EditorFooter from './editor-footer';
import { EditorHeader } from './editor-header';
import { Threads } from './editor-threads';
import EditorToolbar from './editor-toolbar';
import suggestion from './suggestion';

export const Editor = () => {
	const liveblocks = useLiveblocksExtension();

	const selectedNoteId = useStore((s) => s.selectedNoteId);
	const setSelectedNote = useStore((s) => s.setSelectedNote);
	const search = useStore((s) => s.search);
	const sortBy = useStore((s) => s.sortBy);
	const setNotes = useStore((s) => s.setNotes);
	const initialData = useRouteLoaderData('root-notes') as
		| PaginatedNotesResponse
		| undefined;
	const queryClient = useQueryClient();

	const notesQueryKey = ['notes', search, sortBy] as const;
	const { data } = useSuspenseInfiniteQuery({
		queryKey: notesQueryKey,
		queryFn: fetchNotesPage,
		initialPageParam: 1,
		initialData: initialData
			? { pages: [initialData], pageParams: [1] }
			: undefined,
		getNextPageParam: (lastPage) => lastPage.nextPage,
	});

	const allNotes = useMemo(
		() => (data?.pages ?? []).flatMap((p: any) => p?.results ?? []),
		[data],
	);
	const current = useMemo(
		() =>
			allNotes.find((n: UserNote) => n.id === selectedNoteId) ?? allNotes[-1],
		[allNotes, selectedNoteId],
	);

	useEffect(() => {
		setNotes(allNotes as UserNote[]);
	}, [allNotes, setNotes]);

	useEffect(() => {
		if (!selectedNoteId && current?.id) {
			setSelectedNote(current.id);
		}
	}, [current, selectedNoteId, setSelectedNote]);

	const mutation = useMutation({
		mutationFn: (content: string) => {
			if (!current?.id) {
				return Promise.resolve(current as any);
			}
			return updateNote(current.id, { content: content });
		},
		onSuccess: (updated) => {
			if (!updated) return;
			queryClient.setQueryData(notesQueryKey, (old: any) => {
				if (!old) return old;
				if (old.pages) {
					const pages = old.pages.map((pg: any) => ({
						...pg,
						results: pg.results.map((u: any) =>
							u.id === updated.id ? updated : u,
						),
					}));
					return { ...old, pages };
				}
				if (old.results) {
					return {
						...old,
						results: old.results.map((n: any) =>
							n.id === updated.id ? updated : n,
						),
					};
				}
				return old;
			});
			try {
				useStore.getState().upsertNote(updated);
			} catch {}
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
		},
		onCreate: ({ editor: currentEditor }) => {},
		onDestroy: () => {},
		onUpdate: ({ editor: currentEditor }) => {
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
		onSelectionUpdate: ({ editor: currentEditor }) => {},
		onTransaction: ({ editor: currentEditor }) => {},
		onFocus: ({ editor: currentEditor }) => {},
		onBlur: ({ editor: currentEditor }) => {},

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
				origin: 'yourdomain.com',
				progressBarColor: 'white',
			}),
		],
	});

	useEffect(() => {
		if (!editor) return;
		editor.setEditable(Boolean(current));
		if (!current) {
			editor.commands.clearContent(true, { emitUpdate: false });
			return;
		}
		const currentContent = current.note?.content ?? '';
		if (editor.getHTML() !== currentContent) {
			editor.commands.setContent(currentContent);
		}
	}, [editor, current]);

	if (!editor) {
		return (
			<div className="bg-editor text-editor-foreground flex h-screen items-center justify-center">
				<div className="text-lg">Loading editor...</div>
			</div>
		);
	}

	/* const toggleEditable = () => {
				editor.setEditable(!editor.isEditable);
				editor.view.dispatch(editor.view.state.tr);
			};*/

	return (
		<NoteEditorProvider editor={editor}>
			<div className="bg-editor flex h-full flex-col">
				<EditorHeader />
				<EditorToolbar />

				<div className="flex-1 overflow-auto">
					{current ? (
						<div>
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
							<div className="relative">
								<EditorContent
									editor={editor}
									className={cn(
										'bg-editor text-editor-foreground mx-auto h-full min-h-full w-full overflow-hidden border-0 shadow-lg',
									)}
								/>
								<Threads/>
							</div>
						</div>
					) : (
						<div className="text-muted-foreground flex h-full items-center justify-center text-sm">
							Select or create a note to get started.
						</div>
					)}
				</div>
				<EditorFooter />
			</div>
		</NoteEditorProvider>
	);
};
