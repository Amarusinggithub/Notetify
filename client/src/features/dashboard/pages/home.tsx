import { MiniCalendar } from '@/features/calendar';
import { NotebookGrid } from '@/features/notebooks';
import { RecentNotes } from '@/features/notes';
import { UpcomingTasks } from '@/features/tasks';
import { DashboardGrid } from '@/features/dashboard/components/dashboard-grid';

// The home screen composes widgets from several leaf features. It lives in the
// dashboard feature (not under any one feature) so that no leaf feature has to
// depend on another. Each widget is imported through its feature's public
// barrel — the dashboard never reaches into a feature's internals.
export default function Home() {
	return (
		<DashboardGrid>
			<RecentNotes />
			<UpcomingTasks />
			<MiniCalendar />
			<NotebookGrid />
		</DashboardGrid>
	);
}
