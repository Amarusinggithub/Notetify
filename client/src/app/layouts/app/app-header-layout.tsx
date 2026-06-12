import type { PropsWithChildren } from 'react';
import { AppContent } from '@/shared/components/app/app-content';
import { AppHeader } from '@/shared/components/app/app-header';
import { AppShell } from '@/shared/components/app/app-shell';
import { type BreadcrumbItem } from '@/shared/types';
import useNoteStream from '@/features/notes/hooks/use-note-stream';

export default function AppHeaderLayout({
	children,
	breadcrumbs,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
	useNoteStream();

	return (
		<AppShell>
			<AppHeader breadcrumbs={breadcrumbs} />
			<AppContent>{children}</AppContent>
		</AppShell>
	);
}
