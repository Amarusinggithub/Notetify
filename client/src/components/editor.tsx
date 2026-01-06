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
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, Extension, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '../lib/utils';
import { useStore } from '../stores/index.ts';
import type { PaginatedNotesResponse, UserNote } from '../types';
import { useUpdateNote } from '../hooks/use-mutate-note.tsx';
import { useEffect, useRef } from 'react';
import { NoteEditorProvider } from '../context/editor-context.tsx';
import EditorFooter from './editor-footer';
import { EditorHeader } from './editor-header';
//import { Threads } from './editor-threads';
import EditorToolbar from './editor-toolbar';
import suggestion from './suggestion';
import { noteQueryKeys } from '../utils/queryKeys.ts';
import { GripVertical } from 'lucide-react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import {Skeleton} from  '../components/ui/skeleton.tsx';



export const Editor = () => {
	const queryClient = useQueryClient();
	const liveblocks = useLiveblocksExtension();
    const lastLoadedId = useRef<string | null>(null);

	const isMounted = useRef(false);

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
				showOnlyCurrent: false,

				placeholder: ({ node }) => {
					if (node.type.name === 'heading') {
						return 'What’s the title?';
					}

					return 'Write your story here:';
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
			<div className="bg-editor flex h-full flex-col">
				<EditorHeader />
				{/* Toolbar skeleton */}
				<div className="border-editor-border bg-editor flex items-center gap-2 border-b px-4 py-2">
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
					<div className="bg-editor-border mx-2 h-6 w-px" />
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
					<div className="bg-editor-border mx-2 h-6 w-px" />
					<Skeleton className="h-8 w-20" />
				</div>
				{/* Editor content skeleton */}
				<div className="relative flex-1 overflow-auto">
					<div className="bg-editor text-editor-foreground mx-auto h-full min-h-full w-full border-0 px-14 pt-10 pb-10 shadow-lg">
						{/* Title skeleton */}
						<Skeleton className="mb-6 h-10 w-3/5" />
						{/* Paragraph skeletons */}
						<div className="space-y-3">
							<Skeleton className="h-5 w-full" />
							<Skeleton className="h-5 w-[95%]" />
							<Skeleton className="h-5 w-[88%]" />
							<Skeleton className="h-5 w-[92%]" />
							<div className="h-4" />
							<Skeleton className="h-5 w-full" />
							<Skeleton className="h-5 w-[78%]" />
							<Skeleton className="h-5 w-[85%]" />
							<div className="h-4" />
							<Skeleton className="h-5 w-[70%]" />
						</div>
					</div>
				</div>
				<EditorFooter />
			</div>
		);
	}

	return (
		<NoteEditorProvider editor={editor}>
			<div className="bg-editor flex h-full flex-col">
				<EditorHeader currentNoteId={currentUserNote?.id} currentNote={currentUserNote} />
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
							<GripVertical className="h-4 w-4" />
						</DragHandle>
						<div className="relative h-full">
							<EditorContent
								editor={editor}
								className={cn(
									'bg-editor text-editor-foreground mx-auto h-full min-h-full w-full overflow-hidden border-0 shadow-lg',
								)}
							/>
							{/*currentUserNote&& <Threads />*/}
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




const TitleExtension = Extension.create({
  name: 'title',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('title'),

        filterTransaction: (transaction, state) => {
          if (!transaction.docChanged) return true;

          const firstNodeSize = state.doc.firstChild?.nodeSize ?? 0;

          // Check each step to see if it modifies the first node
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
                (newFirstNode.type.name !== 'heading' || newFirstNode.attrs.level !== 1)
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
          if (firstNode.type.name !== 'heading' || firstNode.attrs.level !== 1) {
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

export default TitleExtension;
