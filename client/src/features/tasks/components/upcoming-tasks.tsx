import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';

// Dashboard widget for the tasks feature.
// TODO: wire to useTask() to show tasks due soon.
export function UpcomingTasks() {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Upcoming tasks</CardTitle>
				<CardDescription>Due soon</CardDescription>
			</CardHeader>
			<CardContent className="text-muted-foreground text-sm">
				Nothing due — all caught up.
			</CardContent>
		</Card>
	);
}
