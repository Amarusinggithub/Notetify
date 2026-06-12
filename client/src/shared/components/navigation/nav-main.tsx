import { Link, useLocation } from 'react-router';
import { prefetchNotes } from '@/features/notes/hooks/prefetch-notes';
import { prefetchNotebooks } from '@/features/notebooks/hooks/use-notebook';
import { prefetchTags } from '@/features/tags/hooks/use-tag';
import { type NavItem } from '@/shared/types';
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/shared/components/ui/sidebar';

type NavMainProps = { items: NavItem[] };

const prefetchMap: Record<string, () => void> = {
	'/notes': async () => {
		await prefetchNotes();
	},
	'/notebooks': async () => {
		await prefetchNotebooks();
	},
	'/tags': async () => {
		await prefetchTags();
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
								onFocus={() => prefetchMap[item.href]?.()}
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
