import { useContext } from "react";
import SideNav from "../components/sidebar.tsx";
import "../styles/mainpage.css";

import Navbar from "../components/navbar.tsx";
import { SideNavContext } from "../context/SideNavContext.tsx";
import { Content } from "../components/content.tsx";
import AddTagPopup from "../components/AddTagPopup.tsx";
import EditTagPopup from "../components/EditTagPopup.tsx";

import DeleteTagPopup from "../components/DeleteTagPopup.tsx";

import useTag from "../features/notes/hooks/useTag.tsx";

const MainPage = () => {
  const { isSideNavOpen, isAddTagPopupOpen } = useContext(SideNavContext);
  const { wantToDeleteTag, wantToEditTag } = useTag();

  return (
    <div className="container">
      <Navbar />
      <div className="child-container">
        <SideNav />
        <div
          className="content-container"
          style={{ marginLeft: isSideNavOpen ? "250px" : "50px" }}
        >
          <Content />
          {isAddTagPopupOpen && <AddTagPopup />}
          {wantToDeleteTag === true && <DeleteTagPopup  />}
          {wantToEditTag === true && <EditTagPopup  />}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
