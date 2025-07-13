import { type ReactNode } from 'react';
import { type BreadcrumbItem } from '../types';
import AppLayoutTemplate from './app/app-sidebar-layout';

interface AppLayoutProps {
	children: ReactNode;
	breadcrumbs?: BreadcrumbItem[];
}

export default AppLayout = ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
	<AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
		{children}
	</AppLayoutTemplate>
);
