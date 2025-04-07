import SideNav from "../components/sidebar.tsx";
import "../styles/mainpage.css";
import Navbar from "../components/navbar.tsx";
import { Pages } from "../components/pages.tsx";
import AddTagPopup from "../components/AddTagPopup.tsx";
import EditTagPopup from "../components/EditTagPopup.tsx";
import DeleteTagPopup from "../components/DeleteTagPopup.tsx";
import useTag from "../hooks/useTag.tsx";
import { useSideNav } from "../hooks/useSideNav.tsx";

const App = () => {
  const { isSideNavOpen, isAddTagPopupOpen } = useSideNav();
  const { wantToDeleteTag,wantToEditTag } = useTag();

  

  return (
    <div className="container">
      <Navbar />
      <div className="child-container">
        <SideNav />
        <div
          className="content-container"
          style={{ marginLeft: isSideNavOpen ? "250px" : "50px" }}
        >
          <Pages />
          {isAddTagPopupOpen && <AddTagPopup />}
          {wantToDeleteTag === true && <DeleteTagPopup />}
          {wantToEditTag === true && <EditTagPopup />}
        </div>
      </div>
    </div>
  );
};

export default App;
