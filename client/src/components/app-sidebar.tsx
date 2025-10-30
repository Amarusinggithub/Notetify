import { Link } from 'react-router';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from './ui/sidebar';

import { ScrollArea } from '@radix-ui/react-scroll-area';
import {
	Ellipsis,
	File as FileIcon,
	Home,
	Image as ImageIcon,
	CalendarDays,
	CheckSquare,
	Paperclip,
	Mic,
	Newspaper,
	Notebook,
	NotebookPen,
	Box,
	Star,
	Tag,
	Trash2,
	UsersRound,
    NotepadText,
    CircleCheckBig,
} from 'lucide-react';
import { useCreateNote } from '../hooks/use-mutate-note';
import { useAuthStore } from '../stores/use-auth-store';
import { type NavItem } from '../types';
import AppLogo from './app-logo';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { SearchInput } from './search-input';
import { Button } from './ui/button';
import {
	Dialog,
	DialogContent,
	DialogOverlay,
	DialogPortal,
	DialogTrigger,
} from './ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const mainNavItems: NavItem[] = [
	{
		title: 'Home',
		href: '/',
		icon: Home,
	},
	{
		title: 'Favorites',
		href: '/favorites',
		icon: Star,
		params: 'is_favorite=True&is_trashed=False',
	},
	{
		title: 'Notes',
		href: '/notes',
		icon: Newspaper,
		params: 'is_trashed=False',
	},
	{
		title: 'Tasks',
		href: '/tasks',
		icon: CheckSquare,
	},
	{
		title: 'Files',
		href: '/files',
		icon: Paperclip,
	},
	{
		title: 'Calendar',
		href: '/calender',
		icon: CalendarDays,
	},
	{
		title: 'Tags',
		href: '/tags',
		icon: Tag,
		params: 'is_trashed=False',
	},
	{
		title: 'Notebook',
		href: '/notebooks',
		icon: Notebook,
		params: 'is_trashed=False',
	},

	{
		title: 'Shared with me',
		href: '/shared',
		icon: UsersRound,
		params: 'is_trashed=False',
	},
	{
		title: 'Spaces',
		href: '/spaces',
		icon:Box ,
	},

	{
		title: 'Trash',
		href: '/trash',
		icon: Trash2,
		params: 'is_trashed=True',
	},
];

export function AppSidebar() {
	const createNoteMutation = useCreateNote();
	const currentUserId = useAuthStore.getState().sharedData?.auth.user.id;

	function handleCreateNote() {
		if (!currentUserId) return;
		createNoteMutation.mutate({
			note_data: {
				title: 'Untitled',
				content: '',
				users: [currentUserId],
			},
			tags: [],
			is_pinned: false,
			is_trashed: false,
			is_favorite: false,
		});
	}

	function handleImageQuickAdd() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = () => {
			handleCreateNote();
		};
		input.click();
	}
	return (
		<Sidebar collapsible="offcanvas" variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to={'/home'}>
								<AppLogo />
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<SidebarMenuButton className="h-10" asChild>
							<Dialog>
								<DialogTrigger asChild>
									<SearchInput disabled={false} />
								</DialogTrigger>
								<DialogPortal>
									<DialogOverlay />
									<DialogContent></DialogContent>
								</DialogPortal>
							</Dialog>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<div className="flex items-center gap-2 px-2">
							<Button
								size="lg"
								onClick={handleCreateNote}
								className="h-10 w-40 px-3"
							>
								<NotepadText />
								Note
							</Button>
							<DropdownMenu>
								<Tooltip>
									<TooltipTrigger asChild>
										<DropdownMenuTrigger asChild>
											<Button
												size="icon"
												variant="outline"
												className="h-10 w-10"
											>
												<Ellipsis />
											</Button>
										</DropdownMenuTrigger>
									</TooltipTrigger>
									<TooltipContent>More actions</TooltipContent>
								</Tooltip>
								<DropdownMenuContent className="min-w-48">
									<DropdownMenuGroup>
										<DropdownMenuItem onClick={() => {}}>
											<NotebookPen className="mr-2 size-4" /> Notebook
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => {}}>
											<FileIcon className="mr-2 size-4" /> File
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleImageQuickAdd}>
											<ImageIcon className="mr-2 size-4" /> Image
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => {}}>
											<Mic className="mr-2 size-4" /> Audio
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<div className="flex items-center gap-2 px-2">
							<Button
								size="lg"
								variant={'outline'}
								onClick={handleCreateNote}
								className="h-10 w-26 px-3"
							>
								<CircleCheckBig />
								Task
							</Button>

							<Button
								size="lg"
								variant={'outline'}
								onClick={handleCreateNote}
								className="h-10 w-26 px-3"
							>
								<CalendarDays />
								Event
							</Button>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<ScrollArea>
					<NavMain items={mainNavItems} />
				</ScrollArea>
			</SidebarContent>
			<SidebarSeparator />
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
