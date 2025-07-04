//import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import useAuth from '../hooks/use-auth';
import { useIsMobile } from '../hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar';
import { UserInfo } from './user-info';
import { UserMenuContent } from './user-menu-content';

export function NavUser() {
	const { sharedData } = useAuth();
	const { state } = useSidebar();
	const isMobile = useIsMobile();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size="lg" className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent">
							<UserInfo user={sharedData!.auth.user} />
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="end"
						side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
					>
						<UserMenuContent user={sharedData!.auth.user} />
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
