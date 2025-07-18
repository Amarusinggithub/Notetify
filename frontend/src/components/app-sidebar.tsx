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

import {Home,Tag,
	Notebook,
	Newspaper,
	Star,
	Trash2,
} from 'lucide-react';
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
		href: '/',
		icon: Tag,
		params: 'is_trashed=False',
	},
	{
		title: 'Notebook',
		href: '/',
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
		<Sidebar collapsible="icon" variant="inset">
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

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}



