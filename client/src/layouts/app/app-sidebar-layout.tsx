import { type PropsWithChildren } from 'react';
import { AppContent } from '@/components/app/app-content';
import { AppShell } from '@/components/app/app-shell';
import { AppSidebar } from '@/components/app/app-sidebar';
import { AppSidebarHeader } from '@/components/app/app-sidebar-header';
import { useNoteStream } from '@/hooks/use-note-stream';

export default function AppSidebarLayout({ children }: PropsWithChildren) {
	useNoteStream();

	return (
		<AppShell variant="sidebar">
			<AppSidebar />
			<AppContent variant="sidebar" className="min-h-0 overflow-hidden">
				<AppSidebarHeader />
				<div className="flex-1 overflow-y-auto">{children}</div>
			</AppContent>
		</AppShell>
	);
}
