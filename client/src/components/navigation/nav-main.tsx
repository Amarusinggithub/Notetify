import { Link, useLocation } from 'react-router';
import { prefetchNotes } from '@/hooks/use-note';
import { prefetchNotebooks } from '@/hooks/use-notebook';
import { prefetchTags } from '@/hooks/use-tag';
import { type NavItem } from '@/types';
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

type NavMainProps = { items: NavItem[] };

const prefetchMap: Record<string, () => void> = {
	'/notes': () => {
		prefetchNotes();
	},
	'/notebooks': () => {
		prefetchNotebooks();
	},
	'/tags': () => {
		prefetchTags();
	},
};
export function NavMain({ items = [] }: NavMainProps) {
	const path = useLocation();
	return (
		<SidebarGroup className="px-2 py-0">
			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton
							asChild
							isActive={path.pathname == item.href}
							tooltip={{ children: item.title }}
						>
							<Link
								to={item.href}
								onMouseEnter={() => prefetchMap[item.href]?.()}
							>
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
