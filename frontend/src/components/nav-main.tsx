import { Link, useLocation } from 'react-router';
import { type NavItem } from '../types';

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from './ui/sidebar';

type NavMainProps = { items: NavItem[] };
export function NavMain({ items = [] }: NavMainProps) {
	const path = useLocation();
	return (
		<SidebarGroup className="px-2 py-0">
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton
							asChild
							isActive={path.pathname == item.href}
							tooltip={{ children: item.title }}
						>
							<Link to={item.href}>
								{item.icon && <item.icon />}
								<span>{item.title}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
