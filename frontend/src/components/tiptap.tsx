import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import { OrderedList, TaskItem, TaskList } from '@tiptap/extension-list';
import { TableKit } from '@tiptap/extension-table';
import Youtube from '@tiptap/extension-youtube';
import { CharacterCount, Dropcursor, Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';

import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useState } from 'react';
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
			StarterKit.configure({
				undoRedo: false,
			}),
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
			Document,
			Image,
			Dropcursor,Image,
			Paragraph,
			Text,
			Youtube.configure({
				controls: false,
				nocookie: true,
			}),
			Highlight,
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
					'Write something … It’ll be shared with everyone else looking at this example.',
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

