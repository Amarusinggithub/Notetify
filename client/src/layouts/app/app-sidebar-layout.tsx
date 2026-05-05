import { type PropsWithChildren } from 'react';
import { AppContent } from '@/components/app/app-content';
import { AppShell } from '@/components/app/app-shell';
import { AppSidebar } from '@/components/app/app-sidebar';
//import { AppSidebarHeader } from '@/components/app/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({
	children,
	//breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
	return (
		<AppShell variant="sidebar">
			<AppSidebar />
			<AppContent variant="sidebar" className="overflow-x-hidden">
				{/* <AppSidebarHeader breadcrumbs={breadcrumbs} />*/}
				{children}
			</AppContent>
		</AppShell>
	);
}
