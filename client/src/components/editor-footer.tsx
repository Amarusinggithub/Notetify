import { Bell, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export default function EditorFooter() {
	return (
		<footer className="bg-editor text-editor-foreground border-editor-border sticky bottom-0 z-10 w-full border-t">
			<div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2">
				<div className="flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon" className="size-7">
								<Bell className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent sideOffset={6}>Reminder</TooltipContent>
					</Tooltip>

					<Button variant="ghost" size="sm" className="gap-2">
						<Plus className="size-4" />
						Add tag
					</Button>
				</div>
			</div>
		</footer>
	);
}
