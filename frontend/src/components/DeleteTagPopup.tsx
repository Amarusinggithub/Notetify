import { faXmark, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import useTag from "../features/notes/hooks/useTag";
import "../styles/DeleteTagPopup.css";


const DeleteTagPopup = () => {
  const { removeTag, selectedTag, setWantToDeleteTag } = useTag();

  const handleClose = () => setWantToDeleteTag(false);

  const handleDeleteTag = () => {
    removeTag(selectedTag!);
    handleClose();
  };

  return (
    <div className="delete-tag-popup-bg" onClick={handleClose}>
      <div
        className="delete-tag-popup-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-tag-header">
          <h1 className="delete-tag-title">Delete Tag</h1>
          <button onClick={handleClose} className="close-btn">
            <FontAwesomeIcon icon={faXmark} className="close-icon" />
          </button>
        </div>

        <div className="delete-tag-info-container">
          <FontAwesomeIcon icon={faLightbulb} className="info-icon" />

          <div className="tag-info-text">
            <p className="delete-tag-info">
              Deleting this tag will permanently remove it from all associated
              notes. The notes themselves will remain, but they will no longer
              be linked to this tag.
            </p>
          </div>
        </div>

        <div className="delete-tag-actions">
          <button onClick={handleClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleDeleteTag} className="delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTagPopup;
