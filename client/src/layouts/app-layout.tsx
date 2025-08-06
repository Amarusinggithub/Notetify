//import { type ReactNode } from 'react';
import { Outlet } from 'react-router';
import { type BreadcrumbItem } from '../types';
import AppLayoutTemplate from './app/app-sidebar-layout';

interface AppLayoutProps {
	breadcrumbs?: BreadcrumbItem[];
}

const AppLayout = ({ breadcrumbs, ...props }: AppLayoutProps) => (
	<AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
		<Outlet />{' '}
	</AppLayoutTemplate>
);

export default AppLayout;
