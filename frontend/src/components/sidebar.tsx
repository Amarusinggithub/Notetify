import{  useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sidebarData } from "../utils/sidebarData.tsx";
import "../styles/sidebar.css";
import {  useSideNav } from "../context/SideNavContext.tsx";
import { faPlus, faTag, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import useNote from "../features/notes/hooks/useNote.tsx";
import useTag from "../features/notes/hooks/useTag.tsx";
import { Tag } from "types/types.ts";



const SideNav = () => {
  const { isSideNavOpen, setPage, setAddTagPopupOpen } =useSideNav();
  const { handleTagClick, setTitle } = useNote();
  const { tags, setWantToDeleteTag, setSelectedTag, setWantToEditTag } =
    useTag();

  const [temp, setTemp] = useState<any>(sidebarData[0]);
  const [tempId, setTempId] = useState<any>(null);

  const handleOnClick = (index:number) => {
    return () => {
      setPage(index);
      setTemp(sidebarData[index]);
      setTitle(sidebarData[index].title);
    };
  };

  const handleTagClicked = (tag:Tag) => {
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
        width: isSideNavOpen ? "250px" : "50px",
      }}
    >
      <ul>
        {sidebarData.map((item, index) => (
          <li
            onClick={handleOnClick(index)}
            key={index}
            style={{
              width: isSideNavOpen ? "210px" : "18px",
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
            width: isSideNavOpen ? "210px" : "18px",

            borderTopRightRadius: isSideNavOpen ? "50px" : "360px",
            borderTopLeftRadius: isSideNavOpen ? "0px" : "360px",
            borderBottomLeftRadius: isSideNavOpen ? "0px" : "360px",
            borderBottomRightRadius: isSideNavOpen ? "50px" : "360px",
            justifyContent: isSideNavOpen ? "start" : "center",
            backgroundColor: temp === true ? " rgb(65, 51, 28)" : "",
          }}
          className="sidenav-item-add-tag"
        >
          <div className="icon-and-name">
            <FontAwesomeIcon icon={faPlus} className="icon" />
            {isSideNavOpen && <h3>{"Add Tag"}</h3>}
          </div>
        </li>
        {isSideNavOpen && tags?.length > 0 && (
          <h3 className="title-tags">Tags</h3>
        )}
        {tags?.length > 0 && (
          <ul className="tags">
            {tags.map((tag: Tag, index: number) => (
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagClicked(tag);
                }}
                key={index}
                className="sidenav-item-tags"
                style={{
                  width: isSideNavOpen ? "210px" : "18px",

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
                  <div>
                    <button
                      style={{ display: tempId == tag.id ? "flex" : "" }}
                      className="ellipsis-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tempId !== tag.id) {
                          setTempId(tag.id);
                        } else {
                          setTempId(null);
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faEllipsis} className="icon" />
                    </button>
                    {tempId === tag.id && (
                      <div className="tag-actions">
                        <button
                          style={{ display: "flex" }}
                          className="edit-sidenav-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag);
                            setWantToEditTag(true);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          style={{ display: "flex" }}
                          className="delete-sidenav-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag);
                            setWantToDeleteTag(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
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
