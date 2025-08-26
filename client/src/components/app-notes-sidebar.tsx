import { ArrowDownWideNarrow, Ellipsis, FilterIcon } from 'lucide-react';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Label } from './ui/label';
import {
	NotesSidebar,
	NotesSidebarContent,
	NotesSidebarFooter,
	NotesSidebarHeader,
} from './ui/notes-sidebar';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function EditorNotesSidebar() {
	return (
		<NotesSidebar collapsible="offcanvas" variant="sidebar">
			<NotesSidebarHeader>
				<Label>Notes</Label>

				<DropdownMenu>
					<DropdownMenuTrigger>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button size={'sm'} variant="ghost">
									<FilterIcon />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Add Filters</p>
							</TooltipContent>
						</Tooltip>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuGroup>
							<DropdownMenuItem></DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button size={'sm'} variant="ghost">
									<ArrowDownWideNarrow />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Sort Options</p>
							</TooltipContent>
						</Tooltip>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuGroup>
							<DropdownMenuItem></DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button size={'sm'} variant="ghost">
									<Ellipsis />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>More Actions</p>
							</TooltipContent>
						</Tooltip>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuGroup>
							<DropdownMenuItem></DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</NotesSidebarHeader>

			<NotesSidebarContent>
				<ScrollArea></ScrollArea>
			</NotesSidebarContent>
			<NotesSidebarFooter></NotesSidebarFooter>
		</NotesSidebar>
	);
}
