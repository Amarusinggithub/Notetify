import { useLocation } from "react-router";
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

const routeLabels: Record<string, string> = {
	'': 'Home',
	notes: 'Notes',
	tasks: 'Tasks',
	files: 'Files',
	calender: 'Calendar',
	tags: 'Tags',
	notebooks: 'Notebook',
	shared: 'Shared with me',
	spaces: 'Spaces',
	trash: 'Trash',
};

export default function useBreadcrumbs(): BreadcrumbItemType[] {
	const { pathname } = useLocation();
	const segments = pathname.split('/').filter(Boolean);

	if (segments.length === 0) {
		return [{ title: 'Home', href: '/' }];
	}

	const crumbs: BreadcrumbItemType[] = [{ title: 'Home', href: '/' }];
	let path = '';

	for (const segment of segments) {
		path += `/${segment}`;
		const label = routeLabels[segment];
		if (label) {
			crumbs.push({ title: label, href: path });
		}
	}

	return crumbs;
}
