import { Skeleton } from "../ui/skeleton";
import EditorFooter from "./editor-footer";
import { EditorHeaderSkeleton } from "./editor-header";

// Read-only content preview shown while note data is loading
export const EditorContentPreview = ({ content }: { content: string }) => {
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
			{/* Actual note content rendered as read-only HTML */}
			<div className="relative flex-1 overflow-auto">
				<div
					className="tiptap ProseMirror bg-editor text-editor-foreground mx-auto min-h-full w-full border-0 pt-10 pr-14 pb-10 pl-14 shadow-lg"
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			</div>
			<EditorFooter />
		</div>
	);
};
