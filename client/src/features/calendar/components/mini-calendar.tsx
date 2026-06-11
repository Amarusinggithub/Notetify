import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';

// Dashboard widget for the calendar feature.
// TODO: wire to useEvent() to show this week's events.
export function MiniCalendar() {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Calendar</CardTitle>
				<CardDescription>This week at a glance</CardDescription>
			</CardHeader>
			<CardContent className="text-muted-foreground text-sm">
				No events scheduled.
			</CardContent>
		</Card>
	);
}
