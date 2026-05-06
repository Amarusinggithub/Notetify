import { Skeleton } from "../ui/skeleton";
import EditorFooter from "./editor-footer";
import { EditorHeaderSkeleton } from "./editor-header";

// Loading skeleton for suspense fallback
export const EditorLoadingSkeleton = () => {
	return (
		<div className="bg-editor flex h-full flex-col">
			<EditorHeaderSkeleton />
			{/* Toolbar skeleton */}
			<div className="border-editor-border bg-editor flex items-center gap-2 border-b px-4 py-2">
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
				<div className="bg-editor-border mx-2 h-6 w-px" />
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
				<div className="bg-editor-border mx-2 h-6 w-px" />
				<Skeleton className="h-8 w-20" />
			</div>
			{/* Editor content skeleton */}
			<div className="relative flex-1 overflow-auto">
				<div className="bg-editor text-editor-foreground mx-auto h-full min-h-full w-full border-0 px-14 pt-10 pb-10 shadow-lg">
					{/* Title skeleton */}
					<Skeleton className="mb-6 h-10 w-3/5" />
					{/* Paragraph skeletons */}
					<div className="space-y-3">
						<Skeleton className="h-5 w-full" />
						<Skeleton className="h-5 w-[95%]" />
						<Skeleton className="h-5 w-[88%]" />
						<Skeleton className="h-5 w-[92%]" />
						<div className="h-4" />
						<Skeleton className="h-5 w-full" />
						<Skeleton className="h-5 w-[78%]" />
						<Skeleton className="h-5 w-[85%]" />
						<div className="h-4" />
						<Skeleton className="h-5 w-[70%]" />
					</div>
				</div>
			</div>
			<EditorFooter />
		</div>
	);
};
