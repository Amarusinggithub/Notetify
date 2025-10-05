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
import { useVirtualizer } from '@tanstack/react-virtual';

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import NoteCard from './note-card';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import type { PaginatedNotesResponse } from '../lib/loaders';
import  { useEffect, useMemo, useRef } from 'react';
import { useLoaderData } from 'react-router';

const fetchNotesPage = async ({
	pageParam = 1,
}): Promise<PaginatedNotesResponse> => {
	const response = await axiosInstance.get(`/notes/?page=${pageParam}`);
	return response.data;
};

export function EditorNotesSidebar() {

     const initialData = useLoaderData();

			const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
				useSuspenseInfiniteQuery({
					queryKey: ['notes'],
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


