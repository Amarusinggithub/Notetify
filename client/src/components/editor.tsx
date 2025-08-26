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
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import useEditorStore from '../hooks/use-editor-store';
import { cn } from '../lib/utils';
import EditorFooter from './editor-footer';
import { EditorHeader } from './editor-header';
import EditorToolbar from './editor-toolbar';
import suggestion from './suggestion';

export const Editor = () => {
	const liveblocks = useLiveblocksExtension();

	const { setEditor } = useEditorStore();

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
			StarterKit.configure({ history: false }),
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
			Table,
			TableRow,
			TableHeader,
			TableCell,
			FontFamily,
			TextAlign.configure({
				defaultAlignment: 'left',
				types: ['heading', 'paragraph'],
			}),
			TextStyle.configure({ mergeNestedSpanStyles: true }),
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
