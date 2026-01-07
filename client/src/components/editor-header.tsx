import { useOthers } from '@liveblocks/react/suspense';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
	ArrowRightLeft,
	ChevronDown,
	Copy,
	CopyPlus,
	Eye,
	FilePlus2,
	Globe2,
	History,
	Home,
	Info,
	Link2,
	ListTree,
	Lock,
	Maximize2,
	Minimize2,
	MoreHorizontal,
	Notebook as NotebookIcon,
	PenLine,
	Printer,
	Search,
	Send,
	Share2,
	Star,
	Tag,
	Trash2,
} from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import type { BreadcrumbItem, PaginatedNotesResponse, UserNote } from 'types';
import { useDeleteNote } from '../hooks/use-mutate-note';
import { useStore } from '../stores/index.ts';
import { noteQueryKeys } from '../utils/queryKeys.ts';
import { Breadcrumbs } from './breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { NotesSidebarTrigger, useNotesSidebar } from './ui/notes-sidebar';
import { Separator } from './ui/separator';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function EditorHeader({
	breadcrumbs = [],
	currentNoteId = null,
}: {
	breadcrumbs?: BreadcrumbItem[];
	currentNoteId?: string | null;
}) {
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
	const queryClient = useQueryClient();

	const currentUser = useStore((s) => s.sharedData?.auth.user);
	const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
	const inviteRoleLabel = inviteRole === 'editor' ? 'Editor' : 'Viewer';
	const [linkAccess, setLinkAccess] = useState<'restricted' | 'anyone'>(
		'restricted',
	);
	const linkAccessLabel =
		linkAccess === 'restricted' ? 'Restricted' : 'Anyone with link';

	const noteUrl = currentNoteId
		? `${globalThis.window.location.origin}/notes/${currentNoteId}`
		: globalThis.window.location.href;

	const deleteNoteMutation = useDeleteNote();
	const others = useOthers();
	const collaborators = others.slice(0, 3);
	const search = useStore((s) => s.searchNotes);
	const sortBy = useStore((s) => s.sortNotesBy);

	// Subscribe to cache changes so the component re-renders when notes are updated
	const paginatedNotes = useSyncExternalStore(
		(onStoreChange) => queryClient.getQueryCache().subscribe(onStoreChange),
		() =>
			queryClient.getQueryData<InfiniteData<PaginatedNotesResponse>>(
				noteQueryKeys.list(search, sortBy),
			),
	);

	const allNotes = paginatedNotes?.pages.flatMap((page) => page.results) ?? [];

	const currentUserNote =
		allNotes.find((n: UserNote) => n.id === currentNoteId) ?? allNotes[-1];

	const handleDeleteNote = () => {
		if (!currentUserNote) return;
		deleteNoteMutation.mutate(currentUserNote.id);
	};

	const collaboratorsLabel = collaborators.length
		? `${collaborators.length} collaborator${collaborators.length > 1 ? 's' : ''}`
		: 'Only you here';

	const handleFullscreenToggle = () => {
		const anyOpen = appOpen || appOpenMobile || notesOpen || notesOpenMobile;

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
		<header className="bg-editor border-editor-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<NotesSidebarTrigger className="-ml-1" />
					</TooltipTrigger>
					<TooltipContent sideOffset={6}>Toggle Notes</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="-ml-1 size-7"
							onClick={handleFullscreenToggle}
							aria-label="Toggle fullscreen (hide sidebars)"
						>
							{appOpen || appOpenMobile || notesOpen || notesOpenMobile ? (
								<Maximize2 />
							) : (
								<Minimize2 />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent sideOffset={6}>Fullscreen</TooltipContent>
				</Tooltip>

				<Separator orientation="vertical" />

				<Breadcrumbs breadcrumbs={breadcrumbs} />
			</div>

			<div className="flex flex-1 items-center justify-center gap-3 px-4">
				<div className="flex items-center gap-2">
					{collaborators.map((other) => (
						<Avatar
							key={other.connectionId}
							className="border-border size-8 border"
						>
							<AvatarImage src={other.info?.avatar} alt={other.info?.name} />
							<AvatarFallback>
								{other.info?.name?.charAt(0) ?? '?'}
							</AvatarFallback>
						</Avatar>
					))}
					<Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
						{collaboratorsLabel}
					</Badge>
				</div>
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
							<div className="border-border rounded-2xl border bg-white p-4 shadow-xl">
								<Input
									placeholder="Add name or email"
									className="h-11 w-full rounded-xl"
								/>
								<div className="mt-3 flex flex-wrap items-center gap-2">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="h-10 min-w-40 justify-between rounded-lg px-3 text-sm font-medium"
											>
												<span>{inviteRoleLabel}</span>
												<ChevronDown className="size-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start" className="w-48">
											<DropdownMenuItem onClick={() => setInviteRole('editor')}>
												<PenLine className="mr-2 size-4" /> Editor
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setInviteRole('viewer')}>
												<Eye className="mr-2 size-4" /> Viewer
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									<Button
										size="sm"
										className="h-10 rounded-lg bg-[#4f6ef9] px-4 text-white hover:bg-[#3f58d4]"
									>
										<Send className="mr-1 size-4" />
										<span>Send invite</span>
									</Button>
								</div>

								<div className="mt-4 space-y-3">
									<div className="text-foreground flex items-center justify-between text-sm font-medium">
										<span>People with access</span>
										<span className="text-muted-foreground text-xs">1</span>
									</div>
									<div className="border-border flex items-center gap-3 rounded-lg border px-3 py-2">
										<Avatar className="size-9 overflow-hidden rounded-full">
											<AvatarImage
												alt="Current user"
												src={currentUser?.avatar ?? ''}
											/>
											<AvatarFallback className="rounded-full bg-[#ecebff] text-[#4f6ef9]">
												{(
													currentUser?.first_name?.[0] ??
													currentUser?.email?.[0] ??
													'Y'
												).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<div className="text-foreground text-sm font-medium">
												{currentUser
													? `${currentUser.first_name ?? ''} ${currentUser.last_name ?? ''}`.trim() ||
														currentUser.email
													: 'You'}
											</div>
											<div className="text-muted-foreground text-xs">
												{currentUser?.email ?? 'you@example.com'}
											</div>
										</div>
										<span className="text-muted-foreground text-xs font-medium">
											Owner
										</span>
									</div>
								</div>

								<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="h-10 min-w-40 justify-between rounded-lg px-3 text-sm font-medium"
											>
												<span>{linkAccessLabel}</span>
												<ChevronDown className="size-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start" className="w-56">
											<DropdownMenuItem
												onClick={() => setLinkAccess('restricted')}
											>
												<Lock className="mr-2 size-4" /> Restricted
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setLinkAccess('anyone')}>
												<Globe2 className="mr-2 size-4" /> Anyone with link
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									<Button
										variant="outline"
										size="sm"
										onClick={handleCopyLink}
										className="h-10 rounded-lg px-4 text-sm font-medium text-[#4f6ef9] hover:bg-[#eef2ff]"
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
							<DropdownMenuItem onClick={() => console.log('Copy note toï¿½')}>
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
							<DropdownMenuItem onClick={() => console.log('Pin to notebook')}>
								<NotebookIcon className="mr-2 size-4" /> Pin to Notebook
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => console.log('Pin to home')}>
								<Home className="mr-2 size-4" /> Pin to Home
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

// Loading version of header that doesn't use Liveblocks hooks
export function EditorHeaderSkeleton() {
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

	const handleFullscreenToggle = () => {
		const anyOpen = appOpen || appOpenMobile || notesOpen || notesOpenMobile;

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
		<header className="bg-editor border-editor-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<NotesSidebarTrigger className="-ml-1" />
					</TooltipTrigger>
					<TooltipContent sideOffset={6}>Toggle Notes</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="-ml-1 size-7"
							onClick={handleFullscreenToggle}
							aria-label="Toggle fullscreen (hide sidebars)"
						>
							{appOpen || appOpenMobile || notesOpen || notesOpenMobile ? (
								<Maximize2 />
							) : (
								<Minimize2 />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent sideOffset={6}>Fullscreen</TooltipContent>
				</Tooltip>

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
