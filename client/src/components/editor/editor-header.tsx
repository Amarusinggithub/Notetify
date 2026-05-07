import {
	ArrowRightLeft,
	Copy,
	CopyPlus,
	FilePlus2,
	History,
	Home,
	Info,
	Link2,
	ListTree,
	Maximize2,
	Minimize2,
	MoreHorizontal,
	Notebook as NotebookIcon,
	Printer,
	Search,
	Share2,
	Star,
	Tag,
	Trash2,
} from 'lucide-react';
import type { BreadcrumbItem } from 'types';
import {
	useDeleteNote,
	useFetchNote,
	useUpdateNote,
} from '@/hooks/use-note.ts';
import { useStore } from '@/stores/index.ts';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotesSidebarTrigger, useNotesSidebar } from '@/components/ui/notes-sidebar';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function FullscreenToggle() {
	const {
		open: appOpen,
		openMobile: appOpenMobile,
		setOpen: setAppOpen,
		setOpenMobile: setAppOpenMobile,
	} = useSidebar();
	const {
		open: notesOpen,
		openMobile: notesOpenMobile,
		setOpen: setNotesOpen,
		setOpenMobile: setNotesOpenMobile,
	} = useNotesSidebar();

	const anyOpen = appOpen || appOpenMobile || notesOpen || notesOpenMobile;

	const handleFullscreenToggle = () => {
		if (anyOpen) {
			setAppOpen(false);
			setAppOpenMobile(false);
			setNotesOpen(false);
			setNotesOpenMobile(false);
		} else {
			setAppOpen(true);
			setAppOpenMobile(true);
			setNotesOpen(true);
			setNotesOpenMobile(true);
		}
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="-ml-1 size-7"
					onClick={handleFullscreenToggle}
					aria-label="Toggle fullscreen (hide sidebars)"
				>
					{anyOpen ? <Maximize2 /> : <Minimize2 />}
				</Button>
			</TooltipTrigger>
			<TooltipContent sideOffset={6}>Fullscreen</TooltipContent>
		</Tooltip>
	);
}

export function EditorHeader({
	breadcrumbs = [],
	currentNoteId = null,
}: {
	breadcrumbs?: BreadcrumbItem[];
	currentNoteId?: string | null;
}) {
	const currentUser = useStore((s) => s.sharedData?.auth.user);
	const noteUrl = currentNoteId
		? `${globalThis.window.location.origin}/notes/${currentNoteId}`
		: globalThis.window.location.href;

	const deleteNoteMutation = useDeleteNote();
	const updateNoteMutation = useUpdateNote();
	const { data: currentUserNote } = useFetchNote(currentNoteId!);
	const ownerLabel = currentUser
		? `${currentUser.first_name ?? ''} ${currentUser.last_name ?? ''}`.trim() ||
			currentUser.email
		: 'You';

	const handleDeleteNote = () => {
		if (!currentUserNote) return;
		deleteNoteMutation.mutate(currentUserNote.id);
	};

	const handlePinToHome = () => {
		if (!currentUserNote) return;
		updateNoteMutation.mutate({
			id: currentUserNote.id,
			payload: { is_pinned_to_home: !currentUserNote.is_pinned_to_home },
		});
	};

	const handlePinToNotebook = () => {
		if (!currentUserNote) return;
		updateNoteMutation.mutate({
			id: currentUserNote.id,
			payload: {
				is_pinned_to_home: !currentUserNote.is_pinned_to_home,
			},
		});
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(noteUrl);
		} catch (error) {
			console.error('Failed to copy link', error);
		}
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({ url: noteUrl });
			} catch (error) {
				console.error('Share cancelled or failed', error);
			}
		} else {
			handleCopyLink();
		}
	};

	return (
		<header className="bg-editor border-editor-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] duration-300 ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<NotesSidebarTrigger className="-ml-1" />
					</TooltipTrigger>
					<TooltipContent sideOffset={6}>Toggle Notes</TooltipContent>
				</Tooltip>

				<FullscreenToggle />

				<Separator orientation="vertical" />

				<Breadcrumbs breadcrumbs={breadcrumbs} />
			</div>

			<div className="flex items-center gap-2">
				<Avatar className="border-border size-8 border">
					<AvatarImage src={currentUser?.avatar ?? ''} alt={ownerLabel} />
					<AvatarFallback>
						{ownerLabel.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
					Workspace note
				</Badge>
			</div>

			<div className="ml-auto flex items-center gap-3">
				<div className="h-20px] flex divide-x divide-[#7b8efb]/60 overflow-hidden rounded-[10px] bg-[#4f6ef9] text-white shadow-sm">
					<DropdownMenu>
						<Tooltip>
							<TooltipTrigger asChild>
								<DropdownMenuTrigger asChild>
									<Button
										size="sm"
										className="rounded-none bg-transparent px-5 font-medium text-white hover:bg-[#3f58d4]"
										variant="ghost"
									>
										<Share2 className="size-4" />
										<span>Share</span>
									</Button>
								</DropdownMenuTrigger>
							</TooltipTrigger>
							<TooltipContent sideOffset={6}>Share note</TooltipContent>
						</Tooltip>
						<DropdownMenuContent
							align="end"
							sideOffset={8}
							className="w-90 border-none bg-transparent p-0 shadow-none"
						>
							<div className="bg-popover text-popover-foreground border-border rounded-2xl border p-4 shadow-xl">
								<div className="space-y-1">
									<h3 className="text-foreground text-sm font-semibold">
										Share note
									</h3>
									<p className="text-muted-foreground text-sm">
										Copy the note link or use your device share sheet.
									</p>
								</div>

								<div className="border-border mt-4 flex items-center gap-3 rounded-lg border px-3 py-2">
									<Avatar className="size-9 overflow-hidden rounded-full">
										<AvatarImage
											alt="Current user"
											src={currentUser?.avatar ?? ''}
										/>
										<AvatarFallback className="rounded-full bg-[#ecebff] text-[#4f6ef9]">
											{ownerLabel.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<div className="text-foreground text-sm font-medium">
											{ownerLabel}
										</div>
										<div className="text-muted-foreground text-xs">
											{currentUser?.email ?? 'Signed in user'}
										</div>
									</div>
									<span className="text-muted-foreground text-xs font-medium">
										Owner
									</span>
								</div>

								<div className="mt-4 flex flex-wrap items-center gap-3">
									<Button
										size="sm"
										onClick={handleShare}
										className="h-10 rounded-lg bg-[#4f6ef9] px-4 text-white hover:bg-[#3f58d4]"
									>
										<Share2 className="mr-1 size-4" />
										<span>Share</span>
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={handleCopyLink}
										className="h-10 rounded-lg px-4 text-sm font-medium text-[#4f6ef9] hover:bg-[#eef2ff] dark:text-[#8b9cf7] dark:hover:bg-[#4f6ef9]/10"
									>
										<Link2 className="mr-2 size-4" /> Copy link
									</Button>
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								onClick={handleCopyLink}
								className="rounded-none bg-transparent px-3 text-white hover:bg-[#3f58d4]"
								variant="ghost"
								aria-label="Copy note link"
							>
								<Link2 className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent sideOffset={6}>Copy link</TooltipContent>
					</Tooltip>
				</div>

				<DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<DropdownMenuTrigger asChild>
								<Button
									size="icon"
									variant="ghost"
									className="hover:bg-editor-accent size-8 border border-transparent"
									aria-label="More note actions"
								>
									<MoreHorizontal />
								</Button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent sideOffset={6}>More actions</TooltipContent>
					</Tooltip>
					<DropdownMenuContent className="w-64 rounded-2xl p-2">
						<DropdownMenuGroup className="space-y-1">
							<DropdownMenuItem onClick={handleShare}>
								<Share2 className="mr-2 size-4" /> Share
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleCopyLink}>
								<Link2 className="mr-2 size-4" /> Copy link
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator className="my-2" />

						<DropdownMenuGroup className="space-y-1">
							<DropdownMenuItem onClick={() => console.log('Move note')}>
								<ArrowRightLeft className="mr-2 size-4" /> Move
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => console.log('Copy note to')}>
								<CopyPlus className="mr-2 size-4" /> Copy to
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => console.log('Duplicate note')}>
								<Copy className="mr-2 size-4" /> Duplicate
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator className="my-2" />

						<DropdownMenuGroup className="space-y-1">
							<DropdownMenuItem onClick={() => console.log('Edit tags')}>
								<Tag className="mr-2 size-4" /> Edit tags
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => console.log('Save as template')}>
								<FilePlus2 className="mr-2 size-4" /> Save as Template
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => console.log('Add to shortcuts')}>
								<Star className="mr-2 size-4" /> Add to Shortcuts
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handlePinToNotebook}>
								<NotebookIcon className="mr-2 size-4" />
								{currentUserNote?.is_pinned_to_home
									? 'Unpin from Notebook'
									: 'Pin to Notebook'}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handlePinToHome}>
								<Home className="mr-2 size-4" />
								{currentUserNote?.is_pinned_to_home
									? 'Unpin from Home'
									: 'Pin to Home'}
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator className="my-2" />

						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<ListTree className="mr-2 size-4" /> Collapsible sections
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem onClick={() => console.log('Collapse all')}>
									Collapse all
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => console.log('Expand all')}>
									Expand all
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>

						<DropdownMenuSeparator className="my-2" />

						<DropdownMenuGroup className="space-y-1">
							<DropdownMenuItem onClick={() => console.log('Find in note')}>
								<Search className="mr-2 size-4" /> Find in note
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => console.log('Note info')}>
								<Info className="mr-2 size-4" /> Note info
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => console.log('Note history')}>
								<History className="mr-2 size-4" /> Note history
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator className="my-2" />

						<DropdownMenuItem onClick={() => console.log('Print note')}>
							<Printer className="mr-2 size-4" /> Print
						</DropdownMenuItem>
						<DropdownMenuItem
							disabled={!currentUserNote || deleteNoteMutation.isPending}
							onClick={handleDeleteNote}
							aria-label="Delete note"
							variant="destructive"
						>
							<Trash2 className="mr-2 size-4" /> Move to Trash
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}

export function EditorHeaderSkeleton() {
	return (
		<header className="bg-editor border-editor-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] duration-300 ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<NotesSidebarTrigger className="-ml-1" />
					</TooltipTrigger>
					<TooltipContent sideOffset={6}>Toggle Notes</TooltipContent>
				</Tooltip>

				<FullscreenToggle />

				<Separator orientation="vertical" />

				<Breadcrumbs breadcrumbs={[]} />
			</div>

			<div className="flex flex-1 items-center justify-center gap-3 px-4">
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
						Loading...
					</Badge>
				</div>
			</div>

			<div className="ml-auto flex items-center gap-3">
				<div className="h-20px] flex divide-x divide-[#7b8efb]/60 overflow-hidden rounded-[10px] bg-[#4f6ef9] text-white opacity-50 shadow-sm">
					<Button
						size="sm"
						className="rounded-none bg-transparent px-5 font-medium text-white"
						variant="ghost"
						disabled
					>
						<Share2 className="size-4" />
						<span>Share</span>
					</Button>
					<Button
						size="sm"
						className="rounded-none bg-transparent px-3 text-white"
						variant="ghost"
						disabled
						aria-label="Copy note link"
					>
						<Link2 className="size-4" />
					</Button>
				</div>
				<Button
					size="icon"
					variant="ghost"
					className="hover:bg-editor-accent size-8 border border-transparent"
					disabled
					aria-label="More note actions"
				>
					<MoreHorizontal />
				</Button>
			</div>
		</header>
	);
}
