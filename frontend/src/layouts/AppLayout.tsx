import { Outlet } from 'react-router';
import AddTagPopup from '../components/AddTagPopup.tsx';
import DeleteTagPopup from '../components/DeleteTagPopup.tsx';
import EditTagPopup from '../components/EditTagPopup.tsx';
import Navbar from '../components/Navbar.tsx';
import SideNav from '../components/Sidebar.tsx';
import useMutateTag from '../hooks/use-mutate-tag.tsx';
import useSearchState from '../hooks/use-search-state.tsx';
import { useSideNav } from '../hooks/use-side-nav.tsx';
import Search from '../pages/Search.tsx';
import '../styles/mainpage.css';

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
