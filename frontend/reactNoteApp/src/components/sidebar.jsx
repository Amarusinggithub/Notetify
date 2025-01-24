import { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sidebarData } from "../utils/sidebarData.jsx";
import "../styles/sidebar.css";
import { SideNavContext } from "../context/SideNavContext.jsx";
import { faPlus, faTag, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import useNote from "../features/notes/hooks/useNote.jsx";

const SideNav = () => {
  const { isSideNavOpen, setPage, setAddTagPopupOpen } =
    useContext(SideNavContext);
  const { tags, handleTagClick, setTitle } = useNote();
  const [temp, setTemp] = useState(sidebarData[0]);

  const handleOnClick = (index) => {
    return () => {
      setPage(index);
      setTemp(sidebarData[index]);
      setTitle(sidebarData[index].title);
    };
  };

  const handleTagClicked = (tag) => {
    setTemp(tag);
    setTitle(tag.name);
    handleTagClick(tag);
    setPage(5);
  };

  const handleCreateTag = () => {
    setTemp(true);
    console.log("set AddTagPopupOpen to be true");
    setAddTagPopupOpen(true);
  };

  return (
    <div
      className="sidenav"
      style={{
        width: isSideNavOpen ? "250px" : "60px",
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
              backgroundColor:
                sidebarData[index] === temp ? " rgb(65, 51, 28)" : "",
            }}
            className="sidenav-item"
          >
            <div className="icon-and-name">
              <FontAwesomeIcon icon={item.icon} className="icon" />
              {isSideNavOpen && <h3>{item.title}</h3>}
            </div>
          </li>
        ))}
      </ul>

      <ul>
        <li
          onClick={handleCreateTag}
          style={{
            borderTopRightRadius: isSideNavOpen ? "50px" : "360px",
            borderTopLeftRadius: isSideNavOpen ? "0px" : "360px",
            borderBottomLeftRadius: isSideNavOpen ? "0px" : "360px",
            borderBottomRightRadius: isSideNavOpen ? "50px" : "360px",
            justifyContent: isSideNavOpen ? "start" : "center",
            backgroundColor: temp === true ? " rgb(65, 51, 28)" : "",
          }}
          className="sidenav-item"
        >
          <div className="icon-and-name">
            <FontAwesomeIcon icon={faPlus} className="icon" />
            {isSideNavOpen && <h3>{"Add Tag"}</h3>}
          </div>
        </li>
        {isSideNavOpen && tags?.length > 0 && (
          <h3 className="title-tags">{"Tags"}</h3>
        )}
        {tags?.length > 0 && (
          <ul className="tags">
            {tags.map((tag, index) => (
              <li
                onClick={() => handleTagClicked(tag)}
                key={index}
                className="sidenav-item-tags"
                style={{
                  borderTopRightRadius: isSideNavOpen ? "50px" : "360px",
                  borderTopLeftRadius: isSideNavOpen ? "0px" : "360px",
                  borderBottomLeftRadius: isSideNavOpen ? "0px" : "360px",
                  borderBottomRightRadius: isSideNavOpen ? "50px" : "360px",
                  justifyContent: isSideNavOpen ? "start" : "center",
                  backgroundColor: tag === temp ? " rgb(65, 51, 28)" : "",
                }}
              >
                <div className="icon-and-name">
                  <FontAwesomeIcon icon={faTag} className="icon" />
                  {isSideNavOpen && <h3>{tag.name}</h3>}
                </div>
                {isSideNavOpen && (
                  <button className="ellipsis-btn" onClick={() => {}}>
                    <FontAwesomeIcon icon={faEllipsis} className="icon" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </ul>
    </div>
  );
};

export default SideNav;
