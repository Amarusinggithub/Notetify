import { useVirtualizer } from '@tanstack/react-virtual';
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

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { useRouteLoaderData } from 'react-router';
import { fetchNotesPage } from '../lib/notes';
import { useNotesStore } from '../stores/use-notes-store';
import NoteCard from './note-card';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function EditorNotesSidebar() {
	const initialData = useRouteLoaderData('root-notes');
	const search = useNotesStore((s) => s.search);
	const sortBy = useNotesStore((s) => s.sortBy);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery({
			queryKey: ['notes', search, sortBy],
			queryFn: fetchNotesPage,
			initialPageParam: 1,
			initialData: {
				pages: [initialData],
				pageParams: [1],
			},
			getNextPageParam: (lastPage) => lastPage.nextPage,
		});

	const allNotes = useMemo(
		() => data?.pages.flatMap((page) => page.results) ?? [],
		[data],
	);

	const parentRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: allNotes.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 200,
		overscan: 5,
	});

	const virtualItems = rowVirtualizer.getVirtualItems();

	useEffect(() => {
		const lastItem = virtualItems[virtualItems.length - 1];
		if (!lastItem) {
			return;
		}

		if (
			lastItem.index >= allNotes.length - 1 &&
			hasNextPage &&
			!isFetchingNextPage
		) {
			fetchNextPage();
		}
	}, [
		hasNextPage,
		fetchNextPage,
		allNotes.length,
		isFetchingNextPage,
		virtualItems,
	]);
	return (
		<NotesSidebar collapsible="offcanvas" variant="inset">
			<NotesSidebarHeader>
				<div className="flex flex-row items-center gap-x-1">
					<Label className="scroll-m-20 text-2xl font-semibold tracking-tight">
						Notes
					</Label>{' '}
					<h3 className="muted-foreground scroll-m-20 text-xl font-semibold tracking-tight">
						{allNotes.length}
					</h3>
				</div>

				<div className="flex flex-1 items-center justify-end gap-2">
				
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

				<NotesSidebarSeparator />
			</NotesSidebarHeader>

			<NotesSidebarContent>
				<ScrollArea ref={parentRef} className="h-full w-full">
					<div
						style={{
							height: `${rowVirtualizer.getTotalSize()}px`,
							width: '100%',
							position: 'relative',
						}}
					>
						{virtualItems.map((virtualItem) => {
							const note = allNotes[virtualItem.index];
							return (
								<div
									key={virtualItem.key}
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: `${virtualItem.size}px`,
										transform: `translateY(${virtualItem.start}px)`,
									}}
								>
									<NoteCard key={note.id} userNote={note} />
								</div>
							);
						})}
					</div>
					<div>
						{isFetchingNextPage
							? 'Loading more...'
							: !hasNextPage
								? 'Nothing more to load'
								: ''}
					</div>
				</ScrollArea>
			</NotesSidebarContent>
			<NotesSidebarFooter></NotesSidebarFooter>
		</NotesSidebar>
	);
}
