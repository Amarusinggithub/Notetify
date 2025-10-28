import type { BreadcrumbItem } from 'types';
import { Breadcrumbs } from './breadcrumbs';
import { ModeToggle } from './mode-toggle';
import { NotesSidebarTrigger } from './ui/notes-sidebar';
import { SidebarTrigger } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';

export function EditorHeader({
	breadcrumbs = [],
}: {
	breadcrumbs?: BreadcrumbItem[];
}) {
	return (
		<header className="bg-editor border-editor-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<NotesSidebarTrigger className="-ml-1" />
					</TooltipTrigger>
					<TooltipContent>Notes</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<SidebarTrigger className="-ml-1">
							<NotesSidebarTrigger asChild className="-ml-1 hidden" />
						</SidebarTrigger>
					</TooltipTrigger>
					<TooltipContent>Fullscreen</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<ModeToggle />
					</TooltipTrigger>
					<TooltipContent>Mood Toggle</TooltipContent>
				</Tooltip>
				<Breadcrumbs breadcrumbs={breadcrumbs} />
			</div>
		</header>
	);
}
