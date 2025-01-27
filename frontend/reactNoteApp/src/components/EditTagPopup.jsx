/* eslint-disable react/prop-types */
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState, useRef, useEffect } from "react";
import { SideNavContext } from "../context/SideNavContext";
import useTag from "../features/notes/hooks/useTag";

const EditTagPopup = ({ tag }) => {
  const [TagName, setTagName] = useState("");

  const { setAddTagPopupOpen } = useContext(SideNavContext);
  const { editTag } = useTag();
  const editInputRef = useRef();

  useEffect(() => {
    if (tag) {
      setTagName(tag.name);
      editInputRef.current.focus();
    }
  }, [tag]);

  const handleClose = () => setAddTagPopupOpen(false);

  const handleTagNameChange = (e) => {
    setTagName(e.target.value);
  };

  const handleEditTagName = () => {
    if (TagName.trim() !== "") {
      const updatedTag = { ...tag, name: TagName };
      editTag(updatedTag);
      setTagName("");
    }
    handleClose();
  };

  return (
    <div className="edit-tag-popup-bg">
      <div className="edit-tag-popup-container">
        <div className="edit-tag-header">
          <h1 className="edit-tag-title">Edit Tag</h1>
          <button onClick={handleClose} className="close-btn">
            <FontAwesomeIcon icon={faXmark} className="close-icon" />
          </button>
        </div>

        <input
          ref={editInputRef}
          className="edit-tag-input"
          placeholder="Eg. School or Work"
          value={TagName}
          onChange={handleTagNameChange}
        />

        <div className="edit-tag-actions">
          <button onClick={handleClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleEditTagName} className="edit-btn">
            Edit Tag
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTagPopup;
