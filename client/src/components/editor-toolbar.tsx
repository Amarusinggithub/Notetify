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
import useEditorStore from '../stores/use-editor-store';
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
					editor?.commands.toggleUnderline();
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
				isActive: editor?.isActive('taskList'),
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
		<div className="bg-editor border-editor-border border-b">
			<Toolbar className="bg-editor flex h-10 items-center gap-x-0.5 overflow-x-auto rounded-none px-2.5 py-0.5">
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
				{sections[3]?.length > 0 && (
					<>
						<ToolbarSeparator />
						<ToolbarGroup>
							{sections[3].map((item) => (
								<ToolbarButton key={item.label} {...item} />
							))}
						</ToolbarGroup>
					</>
				)}
			</Toolbar>
		</div>
	);
}

/*import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Pilcrow,
  Redo,
  Strikethrough,
  Undo,
  Underline,
  Quote,
  Highlighter,
} from 'lucide-react';*/
