import { useEffect, useState } from "react";
import useNote from "../hooks/useNote";
import "../styles/AddNoteCard.css";
import NoteContentEditor from "./NoteContentEditor";

const AddNoteCard = () => {
  const { addNote, isLoading, error } = useNote();
  const [noteState, setNoteState] = useState({
    title: "",
    content: "",
    is_favorite: false,
    is_pinned: false,
    is_trashed: false,
    is_archived: false,
  });

  const [isEdited, setIsEdited] = useState(false);
  const [isSelected, setSelected] = useState(false);

  useEffect(() => {
    setIsEdited(false);
  }, [isSelected]);

  const handleSelect = async (e) => {
    e.preventDefault();
    await handleSave();
    setSelected(isSelected ? false : true);
    if (isSelected === false) {
      setNoteState();
    }
  };

  const handleSave = async () => {
    if (isEdited) {
      await addNote({ ...noteState });
    }
    setIsEdited(false);
  };

  const handleTitle = (e) => {
    const newTitle = e.target.value;
    setNoteState((prev) => ({ ...prev, title: newTitle }));
    setIsEdited(newTitle !== null && newTitle !== "");
  };

  const handleContentInput = (newContent) => {
    setNoteState((prev) => ({ ...prev, content: newContent }));
    setIsEdited(newContent !== null && newContent !== "");
  };

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>Error:{error.message} </div>;
  }

  return (
    <div className={isSelected ? "notecard-bg" : ""} onClick={handleSelect}>
      <div
        className={`note-card ${isSelected ? "selected-note" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected) {
            handleSelect(e);
          }
        }}
      >
        {error && <div className="error-banner">{error}</div>}

        <div className="note">
          {!isSelected && <div className="note-title">{noteState.title}</div>}

          {isSelected && (
            <input
              className="note-title"
              placeholder="Enter Title Here"
              onChange={handleTitle}
              value={noteState.title}
              disabled={isLoading}
            />
          )}

          <NoteContentEditor
            content={noteState.content}
            handleContentInput={handleContentInput}
            isSelected={isSelected}
          />
        </div>

        {isSelected && (
          <div className="function-bar">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(e);
              }}
              className="close-btn"
              type="button"
              disabled={isLoading}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddNoteCard;
