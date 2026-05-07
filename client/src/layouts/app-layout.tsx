import { Outlet } from 'react-router';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';

const AppLayout = () => (
	<AppLayoutTemplate>
		<Outlet />
	</AppLayoutTemplate>
);

export default AppLayout;
