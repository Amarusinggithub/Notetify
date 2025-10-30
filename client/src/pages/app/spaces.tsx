export default function Spaces() {
	return (
		<section className="bg-background text-foreground flex min-h-full flex-col gap-4 p-6">
			<header>
				<h1 className="text-2xl font-semibold">Spaces</h1>
				<p className="text-muted-foreground">
					Organize collaborative areas for your team. Create a new space to
					get started.
				</p>
			</header>
			<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No spaces yet. Come back soon!
			</div>
		</section>
	);
}
