export default function Files() {
	return (
		<section className="bg-background text-foreground flex min-h-full flex-col gap-4 p-6">
			<header>
				<h1 className="text-2xl font-semibold">Files</h1>
				<p className="text-muted-foreground">
					Upload and manage attachments linked to your notes and spaces.
				</p>
			</header>
			<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No files have been uploaded yet.
			</div>
		</section>
	);
}
