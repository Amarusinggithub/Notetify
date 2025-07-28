import type { Level } from '@tiptap/extension-heading';
import { cva } from 'class-variance-authority';
import {
	AlignCenterIcon,
	AlignJustifyIcon,
	AlignLeftIcon,
	AlignRightIcon,
	ChevronDownIcon,
	HighlighterIcon,
	ImageIcon,
	Link2Icon,
	ListIcon,
	ListOrderedIcon,
	SearchIcon,
	UploadIcon,
	type LucideIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import { CompactPicker, type ColorResult } from 'react-color';
import useEditorStore from '../../hooks/use-editor-store';
import { cn } from '../../lib/utils';
import { Button } from './button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './dropdown-menu';
import { Input } from './input';
import { Separator } from './separator';

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './dialog';

function ToolbarFontSizeMenuButton() {
	const { editor } = useEditorStore();

	const sizes = [
		8, 9, 10, 12, 14, 15, 16, 18, 20, 24, 30, 36, 48, 64, 72, 96,
	].map((size) => ({
		label: String(size),
		value: `${size}px`,
		isActive: () => editor?.isActive({ fontSize: `${size}px` }),
		onClick: () =>
			/*editor?.commands.setFontSize(`${size}px`)*/ console.log(''),
	}));

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm hover:bg-neutral-200/80',
					)}
				>
					<ListIcon className="size-4" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="max-h-64 overflow-y-auto p-0">
				{sizes.map(({ label, value, isActive, onClick }) => (
					<button
						key={value}
						onClick={onClick}
						className={cn(
							'flex w-full items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
							isActive() && 'bg-neutral-300 font-semibold',
						)}
					>
						<span className="text-sm">{label}</span>
					</button>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ToolbarListButton() {
	const { editor } = useEditorStore();
	const lists = [
		{
			label: 'Bullet list',
			icon: ListIcon,
			isActive: () => editor?.isActive('bulletList'),
			onCLick: () => editor?.chain().focus().toggleBulletList().run(),
		},
		{
			label: 'Ordered list',
			icon: ListOrderedIcon,
			isActive: () => editor?.isActive('orderedList'),
			onCLick: () => editor?.chain().focus().toggleOrderedList().run(),
		},
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'hover :bg-neutral-200/80 flex min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm not-even:h-7',
					)}
				>
					<ListIcon className="size-4" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="p-0">
				{lists.map(({ label, icon: Icon, isActive, onCLick }) => (
					<button
						key={label}
						onClick={onCLick}
						className={cn(
							'flex items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
							isActive() && 'bg-neutral-200/80',
						)}
					>
						<Icon className="size-4" />
						<span className="text-sm">{label}</span>
					</button>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ToolbarAlignButton() {
	const { editor } = useEditorStore();
	const alignments = [
		{
			label: 'Align left',
			value: 'left',
			icon: AlignLeftIcon,
		},
		{
			label: 'Align Center',
			value: 'center',
			icon: AlignCenterIcon,
		},
		{
			label: 'Align right',
			value: 'right',
			icon: AlignRightIcon,
		},
		{
			label: 'Align justify',
			value: 'justify',
			icon: AlignJustifyIcon,
		},
		{
			label: 'Align right',
			value: 'right',
			icon: AlignRightIcon,
		},
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'hover :bg-neutral-200/80 flex min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm not-even:h-7',
					)}
				>
					<AlignLeftIcon className="size-4" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="p-0">
				{alignments.map(({ label, icon: Icon, value }) => (
					<button
						key={value}
						onClick={() => editor?.commands.setTextAlign(value)}
						className={cn(
							'flex items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
							editor?.isActive({ textAlign: value }) && 'bg-neutral-200/80',
						)}
					>
						<Icon className="size-4" />
						<span className="text-sm">{label}</span>
					</button>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ToolbarImageButton() {
	const { editor } = useEditorStore();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const onChange = (src: string) => {
		editor?.chain().focus().setImage({ src }).run();
	};

	const onUpload = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';

		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				const imageUrl = URL.createObjectURL(file);
				onChange(imageUrl);
			}
		};
		input.click();
	};

	const handleImageUrlSubmit = () => {
		if (imageUrl) {
			onChange(imageUrl);
			setImageUrl('');
			setIsDialogOpen(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						className={cn(
							'hover :bg-neutral-200/80 flex min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm not-even:h-7',
						)}
					>
						<ImageIcon className="size-4" />
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuItem onClick={onUpload}>
						<UploadIcon className="mr-2 size-4" />
						Upload
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
						<SearchIcon className="mr-2 size-4" />
						Paste Image Url
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Insert Image Url</DialogTitle>
					</DialogHeader>
					<Input
						placeholder="Insert Image Url"
						value={imageUrl}
						onChange={(e) => setImageUrl(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleImageUrlSubmit();
							}
						}}
					/>
					<DialogFooter>
						<Button onClick={handleImageUrlSubmit}></Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function ToolbarLinkButton() {
	const { editor } = useEditorStore();
	const [value, setValue] = useState(editor?.getAttributes('link').href || '');
	const onChange = (href: string) => {
		editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
		setValue('');
	};

	return (
		<DropdownMenu
			onOpenChange={(open) => {
				if (open) {
					setValue(editor?.getAttributes('link').href || '');
				}
			}}
		>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'hover :bg-neutral-200/80 flex min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm not-even:h-7',
					)}
				>
					<Link2Icon className="size-4" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="flex items-center gap-x-2 p-2.5">
				<Input
					placeholder="https://example.com"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
				<Button
					onClick={() => {
						onChange(value);
					}}
				>
					Apply
				</Button>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ToolbarTextHighlightButton() {
	const { editor } = useEditorStore();
	const value = editor?.getAttributes('highlight').color || '#000000';

	const onChange = (color: ColorResult) => {
		editor?.chain().focus().setHighlight({ color: color.hex }).run();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'hover :bg-neutral-200/80 flex min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm not-even:h-7',
					)}
				>
					<HighlighterIcon className="size-4" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="p-0">
				<CompactPicker color={value} onChange={onChange} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ToolbarTextColorButton() {
	const { editor } = useEditorStore();
	const value = editor?.getAttributes('textStyle').color || '#000000';
	const onChange = (color: ColorResult) => {
		//editor?.chain().focus().setColor(color.hex).run();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'hover :bg-neutral-200/80 flex min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm not-even:h-7',
					)}
				>
					<span className="text-xs">A</span>
					<div className="h-0.5 w-full" style={{ backgroundColor: value }} />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="p-0">
				<CompactPicker color={value} onChange={onChange} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface ToolbarButtonProps {
	label?: string;
	onClick?: () => void;
	isActive?: boolean;
	icon: LucideIcon;
}

const Toolbar = ({
	className,
	children,
	...props
}: React.ComponentProps<'div'>) => {
	return (
		<div
			className={cn(
				'bg-sidebar text-toolbar-foreground flex h-full w-(--toolbar-width) flex-col',
				className,
			)}
			{...props}
		>
			{children}
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

const ToolbarButton = ({
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

function ToolbarFontFamilyMenuButton() {
	const { editor } = useEditorStore();

	const fonts = [
		{ label: 'Arial', value: 'Arial' },
		{ label: 'Times New Roman', value: 'Times New Roman' },
		{ label: 'Courier New', value: 'Courier New' },
		{ label: 'Georgia', value: 'Georgia' },
		{ label: 'Verdana', value: 'Verdana' },
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'hover :bg-neutral-200/80 flex h-7 w-[120px] shrink-0 items-center justify-between overflow-hidden rounded-sm px-1.5 text-sm',
					)}
				>
					<span className="truncate">
						{editor?.getAttributes('textStyle').fontFamily || 'Arial'}
					</span>
					<ChevronDownIcon className="ml-2 size-4 shrink-0" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="flex flex-col gap-y-1 p-1">
				{fonts.map(({ label, value }) => (
					<DropdownMenuItem>
						{' '}
						<button
							key={value}
							//	onClick={editor?.chain().focus().setFontFamily(value).run}
							style={{ fontFamily: value }}
							className={cn(
								'hover:bg-nuetral-200/80 flex items-center gap-x-2 rounded-sm px-2 py-1',
								editor?.getAttributes('textStyle').fontFamily === value &&
									'bg-neutral-200/80',
							)}
						>
							<span className="text-sm">{label}</span>
						</button>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ToolbarHeadingLevelMenuButton() {
	const { editor } = useEditorStore();

	const headings = [
		{ label: 'Normal text', value: 0, fontSize: '16px' },
		{ label: 'Heading 1', value: 1, fontSize: '32px' },
		{ label: 'Heading 2', value: 2, fontSize: '24px' },
		{ label: 'Heading 3', value: 3, fontSize: '20px' },
		{ label: 'Heading 4', value: 4, fontSize: '18px' },
		{ label: 'Heading 5', value: 5, fontSize: '16px' },
	];

	function getCurrentHeading() {
		for (let level = 1; level <= 5; level++) {
			if (editor?.isActive('heading', { level })) {
				return `Heading ${level}`;
			}
		}
		return 'Normal text';
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'hover :bg-neutral-200/80 flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm',
					)}
				>
					<span className="truncate">{getCurrentHeading()}</span>
					<ChevronDownIcon className="ml-2 size-4 shrink-0" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="flex flex-col gap-y-1 p-1">
				{headings.map(({ label, value, fontSize }) => (
					<DropdownMenuItem>
						{' '}
						<button
							key={value}
							onClick={() => {
								if (value === 0) {
									editor?.chain().focus().setParagraph().run();
								} else {
									editor
										?.chain()
										.focus()
										.toggleHeading({ level: value as Level })
										.run();
								}
							}}
							style={{ fontSize: fontSize }}
							className={cn(
								'hover:bg-nuetral-200/80 flex items-center gap-x-2 rounded-sm px-2 py-1',
								((value === 0 && !editor?.isActive('heading')) ||
									editor?.isActive('heading', { level: value })) &&
									'bg-neutral-200/80',
							)}
						>
							<span className="text-sm">{label}</span>
						</button>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ToolbarInsertMenuButton() {
	//	const { editor } = useEditorStore();
}

function ToolbarGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="toolbar-group"
			data-toolbar="group"
			className={cn('relative flex w-full min-w-0 flex-row p-2', className)}
			{...props}
		/>
	);
}

function ToolbarSeparator({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="toolbar-separator"
			data-toolbar="separator"
			orientation={'vertical'}
			className={cn('h-1 bg-neutral-300', className)}
			{...props}
		/>
	);
}

export {
	Toolbar,
	ToolbarAlignButton,
	ToolbarButton,
	ToolbarFontFamilyMenuButton,
	ToolbarFontSizeMenuButton,
	ToolbarGroup,
	ToolbarHeadingLevelMenuButton,
	ToolbarImageButton,
	ToolbarInsertMenuButton,
	ToolbarLinkButton,
	ToolbarListButton,
	toolbarMenuButtonVariants,
	ToolbarSeparator,
	ToolbarTextColorButton,
	ToolbarTextHighlightButton,
};
