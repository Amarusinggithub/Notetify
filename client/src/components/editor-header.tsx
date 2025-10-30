import type { BreadcrumbItem } from 'types';
import { Breadcrumbs } from './breadcrumbs';
import { ModeToggle } from './mode-toggle';
import { NotesSidebarTrigger, useNotesSidebar } from './ui/notes-sidebar';
import { useSidebar } from './ui/sidebar';
import { Button } from './ui/button';
import { Maximize2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';

export function EditorHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItem[];
}) {
    const {
        open: appOpen,
        openMobile: appOpenMobile,
        setOpen: setAppOpen,
        setOpenMobile: setAppOpenMobile,
    } = useSidebar();
    const {
        open: notesOpen,
        openMobile: notesOpenMobile,
        setOpen: setNotesOpen,
        setOpenMobile: setNotesOpenMobile,
    } = useNotesSidebar();

    const handleFullscreenToggle = () => {
        const anyOpen = appOpen || appOpenMobile || notesOpen || notesOpenMobile;
        if (anyOpen) {
            setAppOpen(false);
            setAppOpenMobile(false);
            setNotesOpen(false);
            setNotesOpenMobile(false);
        } else {
            setAppOpen(true);
            setAppOpenMobile(true);
            setNotesOpen(true);
            setNotesOpenMobile(true);
        }
    };
    return (
        <header className="bg-editor border-editor-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <NotesSidebarTrigger className="-ml-1" />
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>Toggle Notes</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="-ml-1 size-7"
                            onClick={handleFullscreenToggle}
                            aria-label="Toggle fullscreen (hide sidebars)"
                        >
                            <Maximize2 />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>Fullscreen</TooltipContent>
                </Tooltip>
               <Separator orientation='vertical'/>
               
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
