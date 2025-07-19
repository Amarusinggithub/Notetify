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

import { Home, Newspaper, Notebook, Star, Tag, Trash2 } from 'lucide-react';
import { type NavItem } from '../types';
import AppLogo from './app-logo';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

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
		title: 'Trash',
		href: '/trash',
		icon: Trash2,
		params: 'is_trashed=True',
	},
];

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to={'/home'}>
								<AppLogo />
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={mainNavItems} />
			</SidebarContent>
			<SidebarSeparator />
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
