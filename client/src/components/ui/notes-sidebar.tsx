import { ChevronLeft } from 'lucide-react';
import * as React from 'react';

import { useIsMobile } from '../../hooks/use-mobile';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Separator } from './separator';
import { TooltipProvider } from './tooltip';
const NOTES_SIDEBAR_COOKIE_NAME = 'sidebar_state';
const NOTES_SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const NOTES_SIDEBAR_WIDTH = '20rem';
const NOTES_SIDEBAR_WIDTH_MOBILE = '18rem';
const NOTES_SIDEBAR_WIDTH_ICON = '3rem';

type NotesSidebarContextProps = {
	state: 'expanded' | 'collapsed';
	open: boolean;
	setOpen: (open: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
};

const NotesSidebarContext =
	React.createContext<NotesSidebarContextProps | null>(null);

function useNotesSidebar() {
	const context = React.useContext(NotesSidebarContext);
	if (!context) {
		throw new Error('useSidebar must be used within a SidebarProvider.');
	}

	return context;
}

function NotesSidebarProvider({
	defaultOpen = true,
	open: openProp,
	onOpenChange: setOpenProp,
	className,
	style,
	children,
	...props
}: React.ComponentProps<'div'> & {
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = React.useState(false);

	// This is the internal state of the sidebar.
	// We use openProp and setOpenProp for control from outside the component.
	const [_open, _setOpen] = React.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = React.useCallback(
		(value: boolean | ((value: boolean) => boolean)) => {
			const openState = typeof value === 'function' ? value(open) : value;
			if (setOpenProp) {
				setOpenProp(openState);
			} else {
				_setOpen(openState);
			}

			// This sets the cookie to keep the sidebar state.
			document.cookie = `${NOTES_SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${NOTES_SIDEBAR_COOKIE_MAX_AGE}`;
		},
		[setOpenProp, open],
	);

	// Helper to toggle the sidebar.
	const toggleNotesSidebar = React.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [isMobile, setOpen, setOpenMobile]);

	// We add a state so that we can do data-state="expanded" or "collapsed".
	// This makes it easier to style the sidebar with Tailwind classes.
	const state = open ? 'expanded' : 'collapsed';

	const contextValue = React.useMemo<NotesSidebarContextProps>(
		() => ({
			state,
			open,
			setOpen,
			isMobile,
			openMobile,
			setOpenMobile,
			toggleSidebar: toggleNotesSidebar,
		}),
		[
			state,
			open,
			setOpen,
			isMobile,
			openMobile,
			setOpenMobile,
			toggleNotesSidebar,
		],
	);

	return (
		<NotesSidebarContext.Provider value={contextValue}>
			<TooltipProvider delayDuration={0}>
				<div
					data-slot="notes-sidebar-wrapper"
					style={
						{
							'--notes-sidebar-width': NOTES_SIDEBAR_WIDTH,
							'--notes-sidebar-width-icon': NOTES_SIDEBAR_WIDTH_ICON,
							...style,
						} as React.CSSProperties
					}
					className={cn(
						'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex h-full w-full overflow-hidden',
						className,
					)}
					{...props}
				>
					{children}
				</div>
			</TooltipProvider>
		</NotesSidebarContext.Provider>
	);
}

function NotesSidebar({
	side = 'left',
	variant = 'inset',
	collapsible = 'offcanvas',
	className,
	children,
	...props
}: React.ComponentProps<'div'> & {
	side?: 'left' | 'right';
	variant?: 'sidebar' | 'floating' | 'inset';
	collapsible?: 'offcanvas' | 'none';
}) {
	const { state } = useNotesSidebar();

	if (collapsible === 'none') {
		return (
			<div
				data-slot="notes-sidebar"
				className={cn(
					'bg-sidebar text-sidebar-foreground flex h-full w-[var(--notes-sidebar-width)] flex-col',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	}

	return (
		<div
			className="group peer text-sidebar-foreground hidden md:block"
			data-state={state}
			data-collapsible={state === 'collapsed' ? collapsible : ''}
			data-variant={variant}
			data-side={side}
			data-slot="notes-sidebar"
		>
			{/* This is what handles the note-sidebar gap on desktop */}
			<div
				data-slot="notes-sidebar-gap"
				className={cn(
					'relative w-[var(--notes-sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear',
					'group-data-[collapsible=offcanvas]:w-0',
					'group-data-[side=right]:rotate-180',
					variant === 'floating' || variant === 'inset'
						? 'group-data-[collapsible=icon]:w-[calc(var(--notes-sidebar-width-icon)+(--spacing(4)))]'
						: 'group-data-[collapsible=icon]:w-[var(--notes-sidebar-width-icon)]',
				)}
			/>
			<div
				data-slot="notes-sidebar-container"
				className={cn(
					'relative z-10 hidden h-full w-[var(--notes-sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex',
					side === 'left'
						? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--notes-sidebar-width)*-1)]'
						: 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--notes-sidebar-width)*-1)]',
					'group-data-[collapsible=offcanvas]:w-0',
					// Adjust the padding for floating and inset variants.
					variant === 'floating' || variant === 'inset'
						? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--notes-sidebar-width-icon)+(--spacing(4))+2px)]'
						: 'group-data-[collapsible=icon]:w-[var(--notes-sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l',
					className,
				)}
				{...props}
			>
				<div
					data-sidebar="notes-sidebar"
					data-slot="notes-sidebar-inner"
					className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
				>
					{children}
				</div>
			</div>
		</div>
	);
}

function NotesSidebarTrigger({
	className,
	onClick,
	...props
}: React.ComponentProps<typeof Button>) {
	const { toggleSidebar } = useNotesSidebar();

	return (
		<Button
			data-sidebar="trigger"
			data-slot="notes-sidebar-trigger"
			variant="ghost"
			size="icon"
			className={cn('size-7', className)}
			onClick={(event) => {
				onClick?.(event);
				toggleSidebar();
			}}
			{...props}
		>
			<ChevronLeft />
			<span className="sr-only">Toggle Sidebar</span>
		</Button>
	);
}

function NotesSidebarRail({
	className,
	...props
}: React.ComponentProps<'button'>) {
	const { toggleSidebar } = useNotesSidebar();

	return (
		<button
			data-sidebar="rail"
			data-slot="notes-sidebar-rail"
			aria-label="Toggle Notes Sidebar"
			tabIndex={-1}
			onClick={toggleSidebar}
			title="Toggle Sidebar"
			className={cn(
				'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex',
				'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
				'[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
				'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
				'[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
				'[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
				className,
			)}
			{...props}
		/>
	);
}

function NotesSidebarInset({
	className,
	...props
}: React.ComponentProps<'main'>) {
	return (
		<main
			data-slot="notes-sidebar-inset"
			className={cn(
				'bg-background relative flex w-full flex-1 flex-col',
				// Inset styling when notes list is open
				'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm',
				// When the notes sidebar is collapsed, remove the inset gap entirely
				'md:peer-data-[variant=inset]:peer-data-[state=collapsed]:m-0 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:rounded-none md:peer-data-[variant=inset]:peer-data-[state=collapsed]:shadow-none',
				className,
			)}
			{...props}
		/>
	);
}

function NotesSidebarHeader({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="notes-sidebar-header"
			data-sidebar="header"
			className={cn('flex flex-col gap-2 p-2', className)}
			{...props}
		/>
	);
}

function NotesSidebarFooter({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="notes-sidebar-footer"
			data-sidebar="footer"
			className={cn('flex flex-col gap-2 p-2', className)}
			{...props}
		/>
	);
}

function NotesSidebarSeparator({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="notes-sidebar-separator"
			data-sidebar="separator"
			className={cn('bg-sidebar-border w-auto', className)}
			{...props}
		/>
	);
}

function NotesSidebarContent({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="notes-sidebar-content"
			data-sidebar="content"
			className={cn(
				'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
				className,
			)}
			{...props}
		/>
	);
}

export {
	NotesSidebar,
	NotesSidebarContent,
	NotesSidebarFooter,
	NotesSidebarHeader,
	NotesSidebarInset,
	NotesSidebarProvider,
	NotesSidebarRail,
	NotesSidebarSeparator,
	NotesSidebarTrigger,
	useNotesSidebar,
};
