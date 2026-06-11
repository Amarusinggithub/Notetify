import { type PropsWithChildren } from 'react';

// Layout shell for the dashboard/home page. Arranges feature widgets in a
// responsive grid. Owned by the dashboard feature — this is the only place
// that knows how the home screen is laid out.
export function DashboardGrid({ children }: PropsWithChildren) {
	return (
		<div className="grid flex-1 auto-rows-min gap-4 overflow-x-auto p-4 md:grid-cols-2 xl:grid-cols-3">
			{children}
		</div>
	);
}
