import {useContext} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {sidebarData,} from "../utils/sidebarData.jsx";
import "../styles/sidebar.css";
import {SideNavContext} from "../context/SideNavContext.jsx"; 
import { faHashtag} from "@fortawesome/free-solid-svg-icons";
import useNote from "../features/notes/hooks/useNote.jsx";
import AddTagPopup from "../features/auth/components/AddTagPopup.jsx";


const SideNav = () => {
    const { isSideNavOpen, setPage, isAddTagPopupOpen, setAddTagPopupOpen } =
      useContext(SideNavContext);
      const { tags,handleTagClick} = useNote();
      



    const handleOnClick = (index) => {
        return () => {
            setPage(index);
        };
    }

    const handleOnClickOfTag = (tag) => {
      return () => {
        handleTagClick(tag);
        setPage(4);
      };
    };

    const handleOnClickAddTag = () => {
      return () => {
        setAddTagPopupOpen(true);
        if(isAddTagPopupOpen){
        <AddTagPopup />;
        }
    }}

  return (
    <div
      className="sidenav"
      style={{
        width: isSideNavOpen ? "250px" : "50px",
      }}
    >
      <ul>
        {sidebarData.map((item, index) => (
          <li
            onClick={handleOnClick(index)}
            key={index}
            style={{
              borderTopRightRadius: isSideNavOpen ? "50px" : "360px",
              borderTopLeftRadius: isSideNavOpen ? "0px" : "360px",
              borderBottomLeftRadius: isSideNavOpen ? "0px" : "360px",
              borderBottomRightRadius: isSideNavOpen ? "50px" : "360px",
              justifyContent: isSideNavOpen ? "start" : "center",
            }}
            className="sidenav-item"
          >
            <FontAwesomeIcon icon={item.icon} className="icon" />
            {isSideNavOpen && <h3>{item.title}</h3>}
          </li>
        ))}
      </ul>

      <ul>
        <li
          onClick={handleOnClickAddTag()}
          style={{
            borderTopRightRadius: isSideNavOpen ? "50px" : "360px",
            borderTopLeftRadius: isSideNavOpen ? "0px" : "360px",
            borderBottomLeftRadius: isSideNavOpen ? "0px" : "360px",
            borderBottomRightRadius: isSideNavOpen ? "50px" : "360px",
            justifyContent: isSideNavOpen ? "start" : "center",
          }}
          className="sidenav-item"
        >
          <FontAwesomeIcon icon={faHashtag} className="icon" />
          {isSideNavOpen && <h3>{"Add Tag"}</h3>}
        </li>

        {tags?.length > 0 && (
          <ul>
            {tags.map((tag, index) => (
              <li
                onClick={handleOnClickOfTag(tag)}
                key={index}
                style={{
                  borderTopRightRadius: isSideNavOpen ? "50px" : "360px",
                  borderTopLeftRadius: isSideNavOpen ? "0px" : "360px",
                  borderBottomLeftRadius: isSideNavOpen ? "0px" : "360px",
                  borderBottomRightRadius: isSideNavOpen ? "50px" : "360px",
                  justifyContent: isSideNavOpen ? "start" : "center",
                }}
                className="sidenav-item"
              >
                <FontAwesomeIcon icon={faHashtag} className="icon" />
                {isSideNavOpen && <h3>{tag.name}</h3>}
              </li>
            ))}
          </ul>
        )}
      </ul>
    </div>
  );
};

export default SideNav;
