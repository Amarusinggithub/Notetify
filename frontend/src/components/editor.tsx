import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Strike from '@tiptap/extension-strike';
import { TextStyle } from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';

import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';

import { useLiveblocksExtension } from '@liveblocks/react-tiptap';
import Blockquote from '@tiptap/extension-blockquote';
import Document from '@tiptap/extension-document';
import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

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
			TextStyle,
			Strike,
			TextAlign.configure({
				defaultAlignment: 'left',
				types: ['heading', 'paragraph'],
			}),
			Emoji.configure({
				emojis: gitHubEmojis,
				enableEmoticons: true,
				suggestion,
			}),

			Heading.configure({
				levels: [1, 2, 3],
			}),
			Document,
			Image,
			Paragraph,
			Text,
			Youtube.configure({
				controls: false,
				nocookie: true,
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
			Highlight.configure({ multicolor: true }),
			Blockquote,
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

			CodeBlock.configure({
				exitOnArrowDown: false,
				exitOnTripleEnter: false,
				defaultLanguage: 'plaintext',
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

	return (
		<div className="bg-editor flex h-screen flex-col">
			<EditorHeader />
			<EditorToolbar />
			<div className="flex-1 overflow-auto">
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
