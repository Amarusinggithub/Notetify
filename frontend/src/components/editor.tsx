import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Strike from '@tiptap/extension-strike';
import { TextStyle } from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';

//import Collaboration from '@tiptap/extension-collaboration';
//import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';

import { useLiveblocksExtension } from '@liveblocks/react-tiptap';
//import { TiptapCollabProvider } from '@hocuspocus/provider';
import Blockquote from '@tiptap/extension-blockquote';
import Document from '@tiptap/extension-document';
import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

import useEditorStore from '../hooks/use-editor-store';
import { getInitialUser } from '../utils/helpers';
import suggestion from './suggestion';
import EditorFooter from './editor-footer';
import { EditorHeader } from './editor-header';
import EditorToolbar from './editor-toolbar';
import { cn } from '../lib/utils';

export const Editor = () => {
	const liveblocks = useLiveblocksExtension();
	const [status, setStatus] = useState('connecting');
	const [currentUser, setCurrentUser] = useState(getInitialUser);
	const { setEditor } = useEditorStore();
	const editor = useEditor({
		editorProps: {
			attributes: {
				spellcheck: 'false',

				class:
					'focus:outline-none print:border-o bg-white border  border-[#c7c7c7] flex-col min-h-[1054px w-[816px]pt-10 pr-14 pb-10 cursor-text',
			},
		},
		enableContentCheck: true,
		onContentError: ({ disableCollaboration, editor: currentEditor }) => {
			disableCollaboration();
			setEditor(currentEditor);
		},
		onCreate: ({ editor: currentEditor }) => {
			setEditor(currentEditor);
			/*provider.on('synced', () => {
				if (currentEditor.isEmpty) {
					currentEditor.commands.setContent(defaultContent);
				}
			});*/
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
			liveblocks.configure({history:false}),
			StarterKit,
			TextStyle,
			Strike,
			TextAlign.configure({
				defaultAlignment: 'right',

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
						// construct URL
						const parsedUrl = url.includes(':')
							? new URL(url)
							: new URL(`${ctx.defaultProtocol}://${url}`);

						// use default validation
						if (!ctx.defaultValidate(parsedUrl.href)) {
							return false;
						}

						// disallowed protocols
						const disallowedProtocols = ['ftp', 'file', 'mailto'];
						const protocol = parsedUrl.protocol.replace(':', '');

						if (disallowedProtocols.includes(protocol)) {
							return false;
						}

						// only allow protocols specified in ctx.protocols
						const allowedProtocols = ctx.protocols.map((p) =>
							typeof p === 'string' ? p : p.scheme,
						);

						if (!allowedProtocols.includes(protocol)) {
							return false;
						}

						// disallowed domains
						const disallowedDomains = [
							'example-phishing.com',
							'malicious-site.net',
						];
						const domain = parsedUrl.hostname;

						if (disallowedDomains.includes(domain)) {
							return false;
						}

						// all checks have passed
						return true;
					} catch {
						return false;
					}
				},
				shouldAutoLink: (url) => {
					try {
						// construct URL
						const parsedUrl = url.includes(':')
							? new URL(url)
							: new URL(`https://${url}`);

						// only auto-link if the domain is not in the disallowed list
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

			/*Collaboration.extend().configure({
				document: ydoc,
			}),
			CollaborationCaret.extend().configure({
				provider,
			}),*/
		],
	});

	/*useEffect(() => {
		// Update status changes
		const statusHandler = (event) => {
			setStatus(event.status);
		};

		provider.on('status', statusHandler);

		return () => {
			provider.off('status', statusHandler);
		};
	}, [provider]);*/

	// Save current user to localStorage and emit to editor
	/*useEffect(() => {
		if (editor && currentUser) {
			localStorage.setItem('currentUser', JSON.stringify(currentUser));
			editor.chain().focus().updateUser(currentUser).run();
		}
	}, [editor, currentUser]);

	const setName = useCallback(() => {
		const name = (window.prompt('Name', currentUser.name) || '')
			.trim()
			.substring(0, 32);

		if (name) {
			return setCurrentUser({ ...currentUser, name });
		}
	}, [currentUser]);

	if (!editor) {
		return null;
	}*/

	return (
		<>
			<EditorHeader  />
			<EditorToolbar />

				<EditorContent editor={editor} className={cn(" h-full bg-")}/>
			<EditorFooter />
		</>
	);
};




