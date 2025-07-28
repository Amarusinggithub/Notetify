import type { BreadcrumbItem } from "types";
import { Breadcrumbs } from "./breadcrumbs";
import { ModeToggle } from "./mode-toggle";
import { SidebarTrigger } from "./ui/sidebar";

export function EditorHeader({
	breadcrumbs = [],
}: {
	breadcrumbs?: BreadcrumbItem[];
}) {
	return (
		<header className="bg-editor border-editor-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<ModeToggle />
				<Breadcrumbs breadcrumbs={breadcrumbs} />
			</div>
		</header>
	);
}
