import {
  faTrash,
  faCheck,
  faPencilAlt,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useRef, useState } from "react";
import useNote from "../features/notes/hooks/useNote";
import { SideNavContext } from "../context/SideNavContext";


const AddTagPopup = () => {
  const [newTagName, setNewTagName] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [tempTagName, setTempTagName] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const inputEditingRef = useRef(null);
  const inputAddingRef = useRef(null);

  const { setAddTagPopupOpen } = useContext(SideNavContext);
  const { addTag, tags, removeTag, editTag } = useNote();

  const handleClose = () => setAddTagPopupOpen(false);

  const handleDeleteTag = async (tag) => {
    await removeTag(tag);
  };

  const handleNewTagChange = (e) => {
    setNewTagName(e.target.value);
  };

  const handleAddNewTag = () => {
    if (newTagName.trim() !== "") {
      addTag(newTagName);
      setNewTagName("");
      setIsAddingTag(false);
    }
  };

  const handleEditStart = (tag) => {
    setEditingTagId(tag.id);
    setTempTagName(tag.name);
    setTimeout(() => inputEditingRef.current?.focus(), 0);
  };

  const handleEditTagChange = (e) => {
    setTempTagName(e.target.value);
  };

  const handleSaveTag = async (updatedTag) => {
    const newUpdatedTag = { ...updatedTag, name: tempTagName };
    await editTag(newUpdatedTag);
    setEditingTagId(null);
  };

  return (
    <div className="container-bg">
      <div className="container">
        <h1 className="title">Add Tag</h1>

        {isAddingTag ? (
          <div className="add-tag-input-group">
            <input
              ref={inputAddingRef}
              type="text"
              placeholder="Enter tag name"
              value={newTagName}
              onChange={handleNewTagChange}
              className="input"
            />
            <button onClick={handleAddNewTag} className="button">
              <FontAwesomeIcon icon={faCheck} className="icon" />
            </button>
          </div>
        ) : (
          <div className="add-tag-container">
            <button
              onClick={() => {
                setIsAddingTag(true);
                setTimeout(() => inputAddingRef.current?.focus(), 0);
              }}
              className="button"
            >
              <FontAwesomeIcon icon={faPlus} className="icon" />
            </button>
            <span className="text">Add A Tag</span>
          </div>
        )}

        {tags.length > 0 && (
          <div className="tags-list">
            {tags.map((tagObj) => {
              if (editingTagId === tagObj.id) {
                return (
                  <div key={tagObj.id} className="tag-item">
                    <input
                      ref={inputEditingRef}
                      type="text"
                      placeholder="Enter tag name"
                      value={tempTagName}
                      onChange={handleEditTagChange}
                      className="input"
                    />
                    <button
                      onClick={() => handleSaveTag(tagObj)}
                      className="button"
                    >
                      <FontAwesomeIcon icon={faCheck} className="icon" />
                    </button>
                  </div>
                );
              }
              return (
                <div key={tagObj.id} className="tag-item">
                  <button
                    onClick={() => handleDeleteTag(tagObj)}
                    className="button"
                  >
                    <FontAwesomeIcon icon={faTrash} className="icon" />
                  </button>
                  <span className="text">{tagObj.name}</span>
                  <button
                    onClick={() => handleEditStart(tagObj)}
                    className="button"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} className="icon" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={handleClose} className="button">
          Done
        </button>
      </div>
    </div>
  );
};

export default AddTagPopup;
