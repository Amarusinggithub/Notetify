import { Link, Outlet, useLocation } from 'react-router';
import Heading from '../../components/heading';
import { Button } from '../../components/ui/button.tsx';
import { Separator } from '../../components/ui/separator';
import { cn } from '../../lib/utils.ts';
import { type NavItem } from '../../types';

//import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
	{
		title: 'General',
		href: '/settings/general',
		icon: null,
	},
	{
		title: 'Account',
		href: '/settings/account',
		icon: null,
	},
	{
		title: 'Billing',
		href: '/settings/billing',
		icon: null,
	},
	{
		title: 'Authentication',
		href: '/settings/authentication',
		icon: null,
	},
];

export default function SettingsLayout() {
	const location = useLocation();
	const currentPath = location.pathname;

	return (
		<div className="px-4 py-6">
			<Heading
				title="Settings"
				description="Manage your profile and account settings"
			/>

			<div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
				<aside className="w-full max-w-xl lg:w-48">
					<nav className="flex flex-col space-y-1 space-x-0">
						{sidebarNavItems.map((item, index) => (
							<Button
								key={`${item.href}-${index}`}
								size="sm"
								variant="ghost"
								asChild
								className={cn('w-full justify-start', {
									'bg-muted': currentPath === item.href,
								})}
							>
								<Link to={item.href}>{item.title}</Link>
							</Button>
						))}
					</nav>
				</aside>

				<Separator className="my-6 md:hidden" />

				<div className="flex-1 md:max-w-2xl">
					<section className="max-w-xl space-y-12">
						<Outlet />
					</section>
				</div>
			</div>
		</div>
	);
}
