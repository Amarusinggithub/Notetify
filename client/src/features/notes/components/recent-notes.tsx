import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';

// Dashboard widget for the notes feature.
// TODO: wire to useNote() to show the user's most recently edited notes.
export function RecentNotes() {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Recent notes</CardTitle>
				<CardDescription>Your latest edits</CardDescription>
			</CardHeader>
			<CardContent className="text-muted-foreground text-sm">
				No recent notes yet.
			</CardContent>
		</Card>
	);
}
