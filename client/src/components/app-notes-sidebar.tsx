import { useVirtualizer } from '@tanstack/react-virtual';
import {
	ArrowUpDown,
	Calendar,
	FilterIcon,
	Notebook,
	Search as SearchIcon,
	Tag as TagIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
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
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import useDebounce from '../hooks/use-debounce';
import { fetchNotesPage } from '../services/note-service.ts';
import { useStore } from '../stores/index.ts';
import NoteCard from './note-card';
import { Input } from './ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import { type LoaderFunctionArgs } from 'react-router';
import axiosInstance from '../lib/axios';
import { type UserNote } from '../types';

export interface PaginatedNotesResponse {
	results: UserNote[];
	nextPage: number | null;
	hasNextPage: boolean;
}

export async function notesLoader({
	request,
}: LoaderFunctionArgs): Promise<PaginatedNotesResponse> {
	const url = new URL(request.url);
	const params = new URLSearchParams(url.search);
	if (!params.get('page')) {
		params.set('page', '1');
	}

	try {
		const response = await axiosInstance.get(`/notes?${params.toString()}`);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch notes:', error);
		return { results: [], nextPage: null, hasNextPage: false };
	}
}

export function EditorNotesSidebar() {
	const initialData = useRouteLoaderData('root-notes');
	const search = useStore((s) => s.search);
	const sortBy = useStore((s) => s.sortBy);
	const setSortBy = useStore((s) => s.setSortBy);
	const setSearch = useStore((s) => s.setSearch);
	const [searchInput, setSearchInput] = useState(search);
	const debouncedSearch = useDebounce(searchInput, 300);

	useEffect(() => {
		if (debouncedSearch !== undefined) {
			setSearch(debouncedSearch);
		}
	}, [debouncedSearch, setSearch]);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	// Local-only filter UI state (not yet applied to API)
	const [filters, setFilters] = useState({
		tags: '',
		notebook: '',
		created: '',
		updated: '',
		showShared: false,
		showSpaces: false,
	});

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery({
			queryKey: ['notes', search, sortBy] as const,
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
					<div className="relative mr-auto hidden w-full max-w-sm md:flex">
						<SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							placeholder="Search notes"
							className="pl-9"
						/>
					</div>

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
						<DropdownMenuContent className="min-w-110 p-0">
							<div className="flex items-center justify-between px-4 py-3">
								<h4 className="text-sm font-semibold">Add Filters</h4>
								<button
									className="text-primary text-xs font-medium hover:underline"
									onClick={(e) => {
										e.preventDefault();
										setFilters({
											tags: '',
											notebook: '',
											created: '',
											updated: '',
											showShared: false,
											showSpaces: false,
										});
									}}
								>
									Clear all
								</button>
							</div>
							<DropdownMenuGroup className="space-y-3 px-4 pb-3">
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2 text-sm">
										<TagIcon className="size-4" />
										<span>Tags</span>
									</div>
									<Select
										value={filters.tags}
										onValueChange={(v) =>
											setFilters((s) => ({ ...s, tags: v }))
										}
									>
										<SelectTrigger size="sm" className="w-48">
											<SelectValue placeholder="Select" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="work">Work</SelectItem>
											<SelectItem value="personal">Personal</SelectItem>
											<SelectItem value="ideas">Ideas</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2 text-sm">
										<Notebook className="size-4" />
										<span>Located in</span>
									</div>
									<Select
										value={filters.notebook}
										onValueChange={(v) =>
											setFilters((s) => ({ ...s, notebook: v }))
										}
									>
										<SelectTrigger size="sm" className="w-48">
											<SelectValue placeholder="Notebook" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="general">General</SelectItem>
											<SelectItem value="work">Work</SelectItem>
											<SelectItem value="personal">Personal</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="size-4" />
										<span>Created</span>
									</div>
									<Select
										value={filters.created}
										onValueChange={(v) =>
											setFilters((s) => ({ ...s, created: v }))
										}
									>
										<SelectTrigger size="sm" className="w-48">
											<SelectValue placeholder="Date" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="today">Today</SelectItem>
											<SelectItem value="yesterday">Yesterday</SelectItem>
											<SelectItem value="7d">Last 7 days</SelectItem>
											<SelectItem value="30d">Last 30 days</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="size-4" />
										<span>Updated</span>
									</div>
									<Select
										value={filters.updated}
										onValueChange={(v) =>
											setFilters((s) => ({ ...s, updated: v }))
										}
									>
										<SelectTrigger size="sm" className="w-48">
											<SelectValue placeholder="Date" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="today">Today</SelectItem>
											<SelectItem value="yesterday">Yesterday</SelectItem>
											<SelectItem value="7d">Last 7 days</SelectItem>
											<SelectItem value="30d">Last 30 days</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</DropdownMenuGroup>

							<div className="space-y-3 border-t px-4 py-3">
								<div className="flex items-center justify-between">
									<button className="text-primary text-sm font-medium">
										Show notes shared with me
									</button>
									<Switch
										checked={filters.showShared}
										onCheckedChange={(v) =>
											setFilters((s) => ({ ...s, showShared: Boolean(v) }))
										}
									/>
								</div>
								<div className="flex items-center justify-between">
									<button className="text-primary text-sm font-medium">
										Show notes in Spaces
									</button>
									<Switch
										checked={filters.showSpaces}
										onCheckedChange={(v) =>
											setFilters((s) => ({ ...s, showSpaces: Boolean(v) }))
										}
									/>
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button size={'sm'} variant="ghost">
										<ArrowUpDown />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Sort Options</p>
								</TooltipContent>
							</Tooltip>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="min-w-56">
							<DropdownMenuLabel>Sort by</DropdownMenuLabel>
							<DropdownMenuRadioGroup
								value={sortBy}
								onValueChange={(v) => {
									if (v === 'created_at' || v === 'updated_at') {
										setSortBy(v);
									}
								}}
							>
								<DropdownMenuRadioItem value="title">
									Title
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="updated_at">
									Date updated
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="created_at">
									Date created
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>

							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuCheckboxItem disabled>
									Show notes in groups
								</DropdownMenuCheckboxItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<NotesSidebarSeparator />
			</NotesSidebarHeader>

			<NotesSidebarContent>
				<ScrollArea ref={parentRef} className="h-full w-full">
					{allNotes.length === 0 ? (
						<div className="text-muted-foreground flex h-full items-center justify-center text-sm">
							No notes yet. Create one to get started.
						</div>
					) : (
						<>
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
						</>
					)}
				</ScrollArea>
			</NotesSidebarContent>
			<NotesSidebarFooter></NotesSidebarFooter>
		</NotesSidebar>
	);
}
