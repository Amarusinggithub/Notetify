import {
    BoldIcon,
	ItalicIcon,
	ListTodoIcon,
	PrinterIcon,
	Redo2Icon,
	RemoveFormattingIcon,
	SpellCheckIcon,
	StrikethroughIcon,
	UnderlineIcon,
	UndoIcon,
	type LucideIcon,
} from 'lucide-react';
import useEditorStore from '../../hooks/use-editore-store';
import { cn } from '../../lib/utils';
import { Separator } from './separator';
import { cva } from 'class-variance-authority';

interface ToolbarButtonProps {
    label?:string;
	onClick?: () => void;
	isActive?: boolean;
	icon: LucideIcon;
}

export const Toolbar = () => {
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
		<div className="flex min-h-[40px] items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-[#F1F4F9] px-2.5 py-0.5">
			{sections[0].map((item) => (
				<ToolbarButton key={item.label} {...item} />
			))}
			<ToolbarSeparator />
			<ToolbarSeparator />
			<ToolbarSeparator />
			{sections[1].map((item) => (
				<ToolbarButton key={item.label} {...item} />
			))}{' '}
			<ToolbarSeparator />
			{sections[2].map((item) => (
				<ToolbarButton key={item.label} {...item} />
			))}{' '}
		</div>
	);
};


const toolbarMenuButtonVariants = cva(
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-toolbar-ring transition-[width,height,padding] hover:bg-toolbar-accent hover:text-toolbar-accent-foreground focus-visible:ring-2 active:bg-toolbar-accent active:text-toolbar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[toolbar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-toolbar-accent data-[active=true]:font-medium data-[active=true]:text-toolbar-accent-foreground data-[state=open]:hover:bg-toolbar-accent data-[state=open]:hover:text-toolbar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'hover:bg-toolbar-accent hover:text-toolbar-accent-foreground',
                outline:
                    'bg-background shadow-[0_0_0_1px_hsl(var(--toolbar-border))] hover:bg-toolbar-accent hover:text-toolbar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--toolbar-accent))]',
            },
            size: {
                default: 'h-8 text-sm',
                sm: 'h-7 text-xs',
                lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);
export const ToolbarButton = ({
	onClick,
	isActive,
	icon: Icon,
}: ToolbarButtonProps) => {
	return (
		<button
			onClick={onClick}
			className={cn(
				'items center flex h-7 min-w-7 justify-center rounded-sm text-sm hover:bg-neutral-200/80',
				isActive && 'bg-neutral-200/80',
			)}
		>
			<Icon className="size-4" />
		</button>
	);
};

const ToolbarGroup = () => {
	return <></>;
};


const ToolbarSeparator = () => {
	return <Separator orientation={'vertical'} className="h-6 bg-neutral-300" />
};
