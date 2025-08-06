import { useInitials } from '../hooks/use-initials';
import { type User } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type UserInfoProps = { user: User; showEmail?: boolean };

export function UserInfo({ user, showEmail = false }: UserInfoProps) {
	const getInitials = useInitials();

	return (
		<>
			<Avatar className="h-8 w-8 overflow-hidden rounded-full">
				<AvatarImage
					src={user.avatar}
					alt={`${user.first_name} ${user.last_name}`}
				/>
				<AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
					{getInitials(`${user.first_name} ${user.last_name}`)}
				</AvatarFallback>
			</Avatar>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{`${user.first_name} ${user.last_name}`}</span>
				{showEmail && (
					<span className="text-muted-foreground truncate text-xs">
						{user.email}
					</span>
				)}
			</div>
		</>
	);
}
