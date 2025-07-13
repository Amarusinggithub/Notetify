import { Link } from 'react-router';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from './ui/sidebar';

import { StarIcon, NotebookTextIcon, Trash2Icon,ArchiveIcon, BookOpen, Folder } from 'lucide-react';
import { type NavItem } from '../types';
import AppLogo from './app-logo';
import { NavFooter } from './nav-footer';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

const mainNavItems: NavItem[] = [
	{
		title: 'Notes',
		href: '/',
		icon: NotebookTextIcon,
		params: 'is_trashed=False&is_archived=False',
	},
	{
		title: 'Favorites',
		href: '/favorite',
		icon: StarIcon,
		params: 'is_favorite=True&is_trashed=False&is_archived=False',
	},
	{
		title: 'Archive',
		href: '/archive',
		icon: ArchiveIcon,
		params: 'is_archived=True&is_trashed=False',
	},
	{
		title: 'Trash',
		href: '/trash',
		icon: Trash2Icon,
		params: 'is_trashed=True',
	},
];

const footerNavItems: NavItem[] = [
	{
		title: 'Repository',
		href: '',
		icon: Folder,
	},
	{
		title: 'Documentation',
		href: '',
		icon: BookOpen,
	},
];

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to={'/dashboard'}>
								<AppLogo />
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={mainNavItems} />
			</SidebarContent>

			<SidebarFooter>
				<NavFooter items={footerNavItems} className="mt-auto" />
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}

/*import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
} from './ui/sidebar';

export function AppSidebar() {
	return (
		<Sidebar >
			<SidebarHeader />
			<SidebarContent>
				<SidebarGroup />
				<SidebarGroup />
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}*/

/*import { Sidebar, SidebarContent } from '@/components/ui/sidebar';

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarContent />
		</Sidebar>
	);
}*/

/*
import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

// Menu items.
const items = [
	{
		title: 'Home',
		url: '#',
		icon: Home,
	},
	{
		title: 'Inbox',
		url: '#',
		icon: Inbox,
	},
	{
		title: 'Calendar',
		url: '#',
		icon: Calendar,
	},
	{
		title: 'Search',
		url: '#',
		icon: Search,
	},
	{
		title: 'Settings',
		url: '#',
		icon: Settings,
	},
];

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
*/
