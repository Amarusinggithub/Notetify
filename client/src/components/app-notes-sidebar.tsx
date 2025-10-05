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
    NotesSidebarSeparator,
} from './ui/notes-sidebar';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function EditorNotesSidebar() {
	return (
		<NotesSidebar collapsible="offcanvas" variant="inset">
			<NotesSidebarHeader>
				<div className="flex flex-row items-center gap-x-1">
					<Label className="scroll-m-20 text-2xl font-semibold tracking-tight">
						Notes
					</Label>{' '}
					<h3 className="muted-foreground scroll-m-20 text-xl font-semibold tracking-tight">
						21
					</h3>
				</div>

				<div className="flex justify-end">
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
				</div>

                <NotesSidebarSeparator/>
			</NotesSidebarHeader>

			<NotesSidebarContent>
				<ScrollArea>
                    
                </ScrollArea>
			</NotesSidebarContent>
			<NotesSidebarFooter></NotesSidebarFooter>
		</NotesSidebar>
	);
}
