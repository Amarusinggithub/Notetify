import { AlertCircle, RefreshCw } from "lucide-react";
import type { Button } from "../ui/button";
import type { Skeleton } from "../ui/skeleton";
import EditorFooter from "./editor-footer";
import { EditorHeaderSkeleton } from "./editor-header";

export function EditorError({
	error,
	reset,
}: {
	error?: Error;
	reset?: () => void;
}) {
	return (
		<div className="bg-editor flex h-full flex-col">
			<EditorHeaderSkeleton />
			<div className="border-editor-border bg-editor flex items-center gap-2 border-b px-4 py-2">
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
			</div>
			<div className="flex flex-1 items-center justify-center">
				<div className="flex flex-col items-center gap-4 p-6 text-center">
					<div className="bg-destructive/10 rounded-full p-3">
						<AlertCircle className="text-destructive h-8 w-8" />
					</div>
					<div className="space-y-2">
						<h3 className="text-lg font-semibold">Failed to load editor</h3>
						<p className="text-muted-foreground max-w-sm text-sm">
							{error?.message ||
								'Something went wrong while loading the editor.'}
						</p>
					</div>
					{reset && (
						<Button variant="outline" onClick={reset} className="gap-2">
							<RefreshCw className="h-4 w-4" />
							Try again
						</Button>
					)}
				</div>
			</div>
			<EditorFooter />
		</div>
	);
}
