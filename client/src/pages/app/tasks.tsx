export default function Tasks() {
	return (
		<section className="bg-background text-foreground flex min-h-full flex-col gap-4 p-6">
			<header>
				<h1 className="text-2xl font-semibold">Tasks</h1>
				<p className="text-muted-foreground">
					Track upcoming todos and assign actions to keep work moving.
				</p>
			</header>
			<div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
				You don&apos;t have any tasks yet.
			</div>
		</section>
	);
}
