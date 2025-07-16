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

import {
	BookOpen,
	NotebookText,
	Star,
	Trash2,
} from 'lucide-react';
import { type NavItem } from '../types';
import AppLogo from './app-logo';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

const mainNavItems: NavItem[] = [
	{
		title: 'Notes',
		href: '/',
		icon: NotebookText,
		params: 'is_trashed=False',
	},
	{
		title: 'Tags',
		href: '/',
		icon: NotebookText,
		params: 'is_trashed=False',
	},
	{
		title: 'Notebook',
		href: '/',
		icon: BookOpen,
		params: 'is_trashed=False',
	},
	{
		title: 'Favorites',
		href: '/favorite',
		icon: Star,
		params: 'is_favorite=True&is_trashed=False',
	},

	{
		title: 'Trash',
		href: '/trash',
		icon: Trash2,
		params: 'is_trashed=True',
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
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}



