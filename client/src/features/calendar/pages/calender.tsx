export default function Calender() {
	return (
		<section className="bg-background text-foreground flex min-h-full flex-col gap-4 p-6">
			<header>
				<h1 className="text-2xl font-semibold">Calendar</h1>
				<p className="text-muted-foreground">
					Plan upcoming work and see tasks alongside scheduled events.
				</p>
			</header>
			<div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
				Calendar integrations coming soon.
			</div>
		</section>
	);
}
