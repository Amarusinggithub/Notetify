import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { OrderedList, TaskItem, TaskList } from '@tiptap/extension-list';
import Strike from '@tiptap/extension-strike';
import { TableKit } from '@tiptap/extension-table';
import {
	BackgroundColor,
	Color,
	FontFamily,
	FontSize,
	TextStyle,
} from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';

import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import {
	BoldIcon,
	ItalicIcon,
	ListTodoIcon,
	type LucideIcon,
	PrinterIcon,
	Redo2Icon,
	RemoveFormattingIcon,
	SpellCheckIcon,
	StrikethroughIcon,
	UnderlineIcon,
	UndoIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
	Toolbar,
	ToolbarButton,
	ToolbarFontFamilyMenuButton,
	ToolbarGroup,
	ToolbarHeadingLevelMenuButton,
	ToolbarLinkButton,
	ToolbarSeparator,
	ToolbarTextColorButton,
	ToolbarTextHighlightButton,
} from './ui/toolbar';
import {  useLiveblocksExtension } from "@liveblocks/react-tiptap";
//import { TiptapCollabProvider } from '@hocuspocus/provider';
import Blockquote from '@tiptap/extension-blockquote';
import Document from '@tiptap/extension-document';
import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { type BreadcrumbItem as BreadcrumbItemType } from '../types';

import useEditorStore from '../hooks/use-editore-store';
import { defaultContent, getInitialUser } from '../utils/helpers';
import { Breadcrumbs } from './breadcrumbs';
import { ModeToggle } from './mode-toggle';
import suggestion from './suggestion';
import { SidebarTrigger } from './ui/sidebar';


export const Editor = ({ ydoc, provider, room }) => {
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
			provider.on('synced', () => {
				if (currentEditor.isEmpty) {
					currentEditor.commands.setContent(defaultContent);
				}
			});
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
			StarterKit,    
			TextStyle,FontSize,
			Strike,
			TextAlign.configure({
				defaultAlignment: 'right',

				types: ['heading', 'paragraph'],
			}),
			FontFamily,
			Emoji.configure({
				emojis: gitHubEmojis,
				enableEmoticons: true,
				suggestion,
			}),
			TableKit.configure({
				table: { resizable: true },
			}),
			Heading.configure({
				levels: [1, 2, 3],
			}),
			Color,
			Document,
			Image,
			Image,
			BackgroundColor,
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
			OrderedList.configure({
				itemTypeName: 'listItem',
				keepMarks: true,
				keepAttributes: true,
			}),
			CodeBlock.configure({
				exitOnArrowDown: false,
				exitOnTripleEnter: false,
				defaultLanguage: 'plaintext',
			}),
			TaskList.configure({
				itemTypeName: 'taskItem',
			}),
			TaskItem.configure({
				nested: true,
			}),
			CharacterCount.extend().configure({
				limit: 10000,
			}),
			Collaboration.extend().configure({
				document: ydoc,
			}),
			CollaborationCaret.extend().configure({
				provider,
			}),
			Placeholder.configure({
				placeholder:
					'Write something …',
			}),
		],
	});

	useEffect(() => {
		// Update status changes
		const statusHandler = (event) => {
			setStatus(event.status);
		};

		provider.on('status', statusHandler);

		return () => {
			provider.off('status', statusHandler);
		};
	}, [provider]);

	// Save current user to localStorage and emit to editor
	useEffect(() => {
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
	}

	return (
		<>
			<EditorHeader />
			<EditorToolbar />

			<div className="print: pring:bg-white print: overflow-auto- size-full overflow-x-auto bg-white p-0 px-4">
				<EditorContent editor={editor} className="" />
				<FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
				<BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>

				<div
					className="collab-status-group"
					data-state={status === 'connected' ? 'online' : 'offline'}
				>
					<label>
						{status === 'connected'
							? `${editor.storage.collaborationCaret.users.length} user${
									editor.storage.collaborationCaret.users.length === 1
										? ''
										: 's'
								} online in ${room}`
							: 'offline'}
					</label>
					<button style={{ '--color': currentUser.color }} onClick={setName}>
						✎ {currentUser.name}
					</button>
				</div>
			</div>
			<EditorFooter />
		</>
	);
};

export function EditorHeader({
	breadcrumbs = [],
}: {
	breadcrumbs?: BreadcrumbItemType[];
}) {
	return (
		<header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" /> <ModeToggle />
				<Breadcrumbs breadcrumbs={breadcrumbs} />
			</div>
		</header>
	);
}
function EditorFooter() {
	return <></>;
}

export default function EditorToolbar() {
	const { editor } = useEditorStore();

	const sections: {
		label: string;
		icon: LucideIcon;
		onClick: () => void;
		isActive?: boolean;
	}[][] = [
		[
			{
				label: 'Undo',
				icon: UndoIcon,
				onClick: () => {
					editor?.chain().focus().undo().run();
				},
			},
			{
				label: 'Redo',
				icon: Redo2Icon,
				onClick: () => {
					editor?.chain().focus().redo().run();
				},
			},
			{
				label: 'Print',
				icon: PrinterIcon,
				onClick: () => {
					window.print();
				},
			},
			{
				label: 'Spell Check',
				icon: SpellCheckIcon,
				onClick: () => {
					const current = editor?.view.dom.getAttribute('spellcheck');
					editor?.view.dom.setAttribute(
						'spellcheck',
						current === 'false' ? 'true' : 'false',
					);
				},
			},
		],
		[
			{
				label: 'Bold',
				icon: BoldIcon,
				isActive: editor?.isActive('bold'),
				onClick: () => {
					editor?.chain().focus().toggleBold().run();
				},
			},
			{
				label: 'Italic',
				icon: ItalicIcon,
				isActive: editor?.isActive('italic'),
				onClick: () => {
					editor?.chain().focus().toggleItalic().run();
				},
			},
			{
				label: 'Underline',
				icon: UnderlineIcon,
				isActive: editor?.isActive('underline'),
				onClick: () => {
					editor?.chain().focus().toggleUnderline().run();
				},
			},
			{
				label: 'Strike',
				icon: StrikethroughIcon,
				isActive: editor?.isActive('strike'),
				onClick: () => {
					editor?.chain().focus().toggleStrike().run();
				},
			},
		],
		[
			{
				label: 'List Todo',
				icon: ListTodoIcon,
				isActive: editor?.isActive('tasklist'),
				onClick: () => {
					editor?.chain().focus().toggleTaskList().run();
				},
			},

			{
				label: 'Remove Formatting',
				icon: RemoveFormattingIcon,
				onClick: () => {
					editor?.chain().focus().unsetAllMarks().run();
				},
			},
		],
	];
	return (
		<>
			<Toolbar className="flex min-h-[40px] items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-[#F1F4F9] px-2.5 py-0.5">
				<ToolbarGroup>
					{sections[0].map((item) => (
						<ToolbarButton key={item.label} {...item} />
					))}
				</ToolbarGroup>
				<ToolbarSeparator />
				<ToolbarFontFamilyMenuButton />
				<ToolbarSeparator />
				<ToolbarHeadingLevelMenuButton />
				<ToolbarSeparator />
				<ToolbarTextColorButton />
				<ToolbarSeparator />
				<ToolbarTextHighlightButton />
				<ToolbarSeparator />
				<ToolbarLinkButton />
				<ToolbarSeparator />

				<ToolbarGroup>
					{sections[1].map((item) => (
						<ToolbarButton key={item.label} {...item} />
					))}
				</ToolbarGroup>
				<ToolbarSeparator />
				<ToolbarGroup>
					{sections[2].map((item) => (
						<ToolbarButton key={item.label} {...item} />
					))}
				</ToolbarGroup>
			</Toolbar>
		</>
	);
}
