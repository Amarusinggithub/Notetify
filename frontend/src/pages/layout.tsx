import SideNav from "../components/sidebar.tsx";
import "../styles/mainpage.css";
import Navbar from "../components/navbar.tsx";
import AddTagPopup from "../components/AddTagPopup.tsx";
import EditTagPopup from "../components/EditTagPopup.tsx";
import DeleteTagPopup from "../components/DeleteTagPopup.tsx";
import useTag from "../hooks/useTag.tsx";
import { useSideNav } from "../hooks/useSideNav.tsx";
import { Outlet } from "react-router";
import useNote from "../hooks/useNote.tsx";
import Search from "./Search.tsx";

const MainLayout = () => {
  const { isSideNavOpen, isAddTagPopupOpen } = useSideNav();
  const { wantToDeleteTag, wantToEditTag } = useTag();
  const {search}=useNote();

  return (
    <div className="container">
      <Navbar />
      <div className="child-container">
        <SideNav />
        <div
          className="content-container"
          style={{ marginLeft: isSideNavOpen ? "250px" : "50px" }}
        >
          {search && search.trim().length >= 1 ? <Search /> : <Outlet />}
          {isAddTagPopupOpen && <AddTagPopup />}
          {wantToDeleteTag && <DeleteTagPopup />}
          {wantToEditTag && <EditTagPopup />}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
