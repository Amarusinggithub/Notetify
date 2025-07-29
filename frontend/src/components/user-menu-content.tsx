import { Link } from 'react-router';

import {
	BadgeCheck,
	Bell,
	CreditCard,
	LogOut,
	Settings,
	Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useMobileNavigation } from '../hooks/use-mobile-navigation';
import { type User } from '../types';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { UserInfo } from './user-info';

interface UserMenuContentProps {
	user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
	const cleanup = useMobileNavigation();
	const { Logout } = useAuth();

	const handleLogout = async () => {
		await Logout();
	};

	return (
		<>
			<DropdownMenuLabel className="p-0 font-normal">
				<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
					<UserInfo user={user} showEmail={true} />
				</div>
			</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem>
					<Sparkles className="mr-2" />
					Upgrade to Pro
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />{' '}
			<DropdownMenuGroup>
				<DropdownMenuItem asChild>
					<Link className="block w-full" to={'./settings'} onClick={cleanup}>
						<Settings className="mr-2" />
						Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<BadgeCheck className="mr-2" />
					Account
				</DropdownMenuItem>
				<DropdownMenuItem>
					<CreditCard className="mr-2" />
					Billing
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Bell className="mr-2" />
					Notifications
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuItem asChild>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant={'ghost'}
							className="flex h-full w-full justify-start"
						>
							<LogOut className="mr-2" />
							Log out
						</Button>
					</AlertDialogTrigger>
					<AlertDialogPortal>
						<AlertDialogOverlay />
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Are you absolutely sure you want to logout?
								</AlertDialogTitle>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleLogout}>
									Confirm
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialogPortal>
				</AlertDialog>
			</DropdownMenuItem>
		</>
	);
}
