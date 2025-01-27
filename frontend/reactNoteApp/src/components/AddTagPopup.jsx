import { faXmark, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { SideNavContext } from "../context/SideNavContext";
import useTag from "../features/notes/hooks/useTag";
import "../styles/AddTagPopup.css";



const AddTagPopup = () => {
  const [TagName, setTagName] = useState("");

  const { setAddTagPopupOpen } = useContext(SideNavContext);
  const { addTag } = useTag();

  const handleClose = () => setAddTagPopupOpen(false);

  const handleTagNameChange = (e) => {
    setTagName(e.target.value);
  };

  const handleAddTagName = () => {
    if (TagName.trim() !== "") {
      addTag(TagName);
      setTagName("");
    }
    handleClose();
  };

  return (
    <div className="add-tag-popup-bg" onClick={handleClose}>
      <div className="add-tag-popup-container">
        <div className="add-tag-header">
          <h1 className="add-tag-title">Create Tag</h1>
          <button onClick={handleClose} className="close-btn">
            <FontAwesomeIcon icon={faXmark} className="close-icon" />
          </button>
        </div>

        <input
          className="add-tag-input"
          placeholder="Eg. School or Work"
          value={TagName}
          onChange={handleTagNameChange}
        />

        <div className="tag-info-container">
          <FontAwesomeIcon icon={faLightbulb} className="info-icon" />

          <div className="tag-info-text">
            <h3 className="tag-info-title">What is a Tag?</h3>
            <p className="tag-info-description">
              Tags help you categorize and quickly find your notes by linking
              related content under a common label.
            </p>
          </div>
        </div>

        <div className="add-tag-actions">
          <button onClick={handleClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleAddTagName} className="create-btn">
            Create Tag
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTagPopup;
