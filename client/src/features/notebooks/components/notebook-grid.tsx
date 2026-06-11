import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';

// Dashboard widget for the notebooks feature.
// TODO: wire to useNotebook() to show the user's notebooks.
export function NotebookGrid() {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Notebooks</CardTitle>
				<CardDescription>Jump back in</CardDescription>
			</CardHeader>
			<CardContent className="text-muted-foreground text-sm">
				No notebooks yet.
			</CardContent>
		</Card>
	);
}
