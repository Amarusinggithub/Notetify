import {
	AlertCircle,
	Bell,
	BellOff,
	Check,
	CheckCheck,
	MessageSquare,
	RefreshCw,
	Share2,
	Star,
	Trash2,
	UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type NotificationType =
	| 'share'
	| 'comment'
	| 'mention'
	| 'invite'
	| 'starred'
	| 'trash'
	| 'system';

interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	timestamp: string;
	read: boolean;
	avatar?: string;
	actionUrl?: string;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
	share: <Share2 className="size-4" />,
	comment: <MessageSquare className="size-4" />,
	mention: <MessageSquare className="size-4" />,
	invite: <UserPlus className="size-4" />,
	starred: <Star className="size-4" />,
	trash: <Trash2 className="size-4" />,
	system: <Bell className="size-4" />,
};

const notificationColors: Record<NotificationType, string> = {
	share: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
	comment: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
	mention: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
	invite: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
	starred: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
	trash: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
	system: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

function NotificationItem({
	notification,
	onMarkAsRead,
}: {
	notification: Notification;
	onMarkAsRead: (id: string) => void;
}) {
	return (
		<div
			className={cn(
				'group relative flex gap-3 px-5 py-3.5 transition-colors hover:bg-accent/50',
				!notification.read && 'bg-accent/30'
			)}
		>
			<div
				className={cn(
					'flex size-9 shrink-0 items-center justify-center rounded-full',
					notificationColors[notification.type]
				)}
			>
				{notificationIcons[notification.type]}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<p
						className={cn(
							'text-sm leading-snug',
							!notification.read ? 'font-semibold' : 'font-medium'
						)}
					>
						{notification.title}
					</p>
					{!notification.read && (
						<span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
					)}
				</div>
				<p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
					{notification.message}
				</p>
				<p className="text-muted-foreground/70 mt-1 text-[11px]">
					{notification.timestamp}
				</p>
			</div>

			{!notification.read && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-3 right-3 size-7 opacity-0 transition-opacity group-hover:opacity-100"
							onClick={(e) => {
								e.stopPropagation();
								onMarkAsRead(notification.id);
							}}
						>
							<Check className="size-3.5" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="left">Mark as read</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
}

function NotificationLoading() {
	return (
		<div className="flex flex-col">
			{Array.from({ length: 5 }).map((_, i) => (
				<div key={i} className="flex gap-3 px-5 py-3.5">
					<Skeleton className="size-9 shrink-0 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-16" />
					</div>
				</div>
			))}
		</div>
	);
}

function NotificationEmpty() {
	return (
		<div className="flex h-full items-center justify-center px-6">
			<Empty className="border-none">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<BellOff className="text-muted-foreground" />
					</EmptyMedia>
					<EmptyTitle>No notifications</EmptyTitle>
					<EmptyDescription>
						You're all caught up. New notifications will appear here when
						someone shares, comments, or mentions you.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}

function NotificationError({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex h-full items-center justify-center px-6">
			<Empty className="border-none">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<AlertCircle className="text-destructive" />
					</EmptyMedia>
					<EmptyTitle>Something went wrong</EmptyTitle>
					<EmptyDescription>
						We couldn't load your notifications. Please try again.
					</EmptyDescription>
				</EmptyHeader>
				<Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
					<RefreshCw className="size-3.5" />
					Try again
				</Button>
			</Empty>
		</div>
	);
}

const mockNotifications: Notification[] = [
	{
		id: '1',
		type: 'share',
		title: 'Alex shared a note with you',
		message: 'Project kickoff meeting notes — includes action items and deadlines for Q3.',
		timestamp: '2 minutes ago',
		read: false,
	},
	{
		id: '2',
		type: 'comment',
		title: 'New comment on "API Design Doc"',
		message: 'Sarah left a comment: "Can we revisit the auth flow? I think there\'s a simpler approach."',
		timestamp: '15 minutes ago',
		read: false,
	},
	{
		id: '3',
		type: 'mention',
		title: 'You were mentioned in a note',
		message: 'Jake mentioned you in "Sprint Retro": "@you can you take a look at the deployment issue?"',
		timestamp: '1 hour ago',
		read: false,
	},
	{
		id: '4',
		type: 'invite',
		title: 'Workspace invitation',
		message: 'Maria invited you to join the "Design System" workspace.',
		timestamp: '3 hours ago',
		read: true,
	},
	{
		id: '5',
		type: 'starred',
		title: 'Note added to favorites',
		message: 'Your note "Component Library Overview" was starred by 3 team members.',
		timestamp: 'Yesterday',
		read: true,
	},
	{
		id: '6',
		type: 'system',
		title: 'Storage almost full',
		message: 'You\'ve used 90% of your storage. Consider upgrading or cleaning up old files.',
		timestamp: '2 days ago',
		read: true,
	},
	{
		id: '7',
		type: 'trash',
		title: 'Note moved to trash',
		message: '"Old Meeting Notes" will be permanently deleted in 30 days.',
		timestamp: '3 days ago',
		read: true,
	},
];

export function NotificationPanel({ hasUnread = false }: { hasUnread?: boolean }) {
	const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
	const [isLoading] = useState(false);
	const [isError] = useState(false);

	const unreadCount = notifications.filter((n) => !n.read).length;
	const showDot = hasUnread || unreadCount > 0;

	const handleMarkAsRead = (id: string) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, read: true } : n))
		);
	};

	const handleMarkAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
	};

	const handleRetry = () => {
		// TODO: integrate with API
	};

	return (
		<Sheet>
			<Tooltip>
				<TooltipTrigger asChild>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="relative size-8"
							aria-label="Notifications"
						>
							<Bell className="size-4" />
							{showDot && (
								<span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-blue-500 ring-2 ring-background" />
							)}
						</Button>
					</SheetTrigger>
				</TooltipTrigger>
				<TooltipContent>Notifications</TooltipContent>
			</Tooltip>

			<SheetContent className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
				<SheetHeader className="space-y-0 border-b py-4 pr-12 pl-5">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<SheetTitle className="text-lg">Notifications</SheetTitle>
							{unreadCount > 0 && (
								<span className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
									{unreadCount > 9 ? '9+' : unreadCount}
								</span>
							)}
						</div>
						{unreadCount > 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="text-muted-foreground h-8 gap-1.5 text-xs"
										onClick={handleMarkAllAsRead}
									>
										<CheckCheck className="size-3.5" />
										Mark all read
									</Button>
								</TooltipTrigger>
								<TooltipContent>Mark all as read</TooltipContent>
							</Tooltip>
						)}
					</div>
				</SheetHeader>

				<ScrollArea className="min-h-0 flex-1">
					{isLoading ? (
						<NotificationLoading />
					) : isError ? (
						<NotificationError onRetry={handleRetry} />
					) : notifications.length === 0 ? (
						<NotificationEmpty />
					) : (
						<div className="flex flex-col">
							{notifications.map((notification, index) => (
								<div key={notification.id}>
									<NotificationItem
										notification={notification}
										onMarkAsRead={handleMarkAsRead}
									/>
									{index < notifications.length - 1 && (
										<Separator className="mx-5 w-auto" />
									)}
								</div>
							))}
						</div>
					)}
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
