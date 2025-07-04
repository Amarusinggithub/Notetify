import { Outlet } from 'react-router';
import AddTagPopup from '../components/add-tag-popup.tsx';
import DeleteTagPopup from '../components/delete-tag-popup.tsx';
import EditTagPopup from '../components/edit-tag-popup.tsx';
import Navbar from '../components/nav-bar.tsx';
import SideNav from '../components/side-nav.tsx';
import useMutateTag from '../hooks/use-mutate-tag.tsx';
import useSearchState from '../hooks/use-search-state.tsx';
import { useSideNav } from '../hooks/use-side-nav.tsx';
import '../styles/mainpage.css';
import Search from '../pages/search.tsx';

const AppLayout = () => {
	const { isSideNavOpen, isAddTagPopupOpen } = useSideNav();
	const { wantToDeleteTag, wantToEditTag } = useMutateTag();
	const { query } = useSearchState();

	return (
		<div className="container">
			<Navbar />
			<div className="child-container">
				<SideNav />
				<div
					className="content-container"
					style={{ marginLeft: isSideNavOpen ? '250px' : '50px' }}
				>
					{query.trim().length >= 1 ? <Search /> : <Outlet />}
					{isAddTagPopupOpen && <AddTagPopup />}
					{wantToDeleteTag && <DeleteTagPopup />}
					{wantToEditTag && <EditTagPopup />}
				</div>
			</div>
		</div>
	);
};

export default AppLayout;

/*

import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main>
				<SidebarTrigger />
				{children}
			</main>
		</SidebarProvider>
	);
}*/


import { type ReactNode } from 'react';
import { type BreadcrumbItem } from '../types';
import AppLayoutTemplate from './app/app-sidebar-layout';

interface AppLayoutProps {
	children: ReactNode;
	breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
	<AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
		{children}
	</AppLayoutTemplate>
);
