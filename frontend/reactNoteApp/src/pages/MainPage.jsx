import { useContext } from "react";
import SideNav from "../components/sidebar.jsx";
import "../styles/mainpage.css";

import Navbar from "../components/navbar.jsx";
import { SideNavContext } from "../context/SideNavContext.jsx";
import { Content } from "../components/content.jsx";
import AddTagPopup from "../components/AddTagPopup.jsx";
import EditTagPopup from "../components/EditTagPopup.jsx";

import DeleteTagPopup from "../components/DeleteTagPopup.jsx";

import useTag from "../features/notes/hooks/useTag.jsx";

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
