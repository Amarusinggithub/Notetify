import "../styles/NoteCard.css";
import {useEffect, useRef, useState} from "react";
import useNote from "../hooks/useNote.jsx";

const NoteCard = ({note}) => {
  const {
    selectedNote,
    setSelectedNote,
    editNote,
    removeNote,
    isLoading,
    error,
  } = useNote();

  const isSelected = selectedNote && selectedNote.id === note.id;
  const noteContentRef = useRef(null);

  const [noteState, setNoteState] = useState({...note});
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    setNoteState({...note});
  }, [note]);

  useEffect(() => {
    if (noteContentRef.current) {
      noteContentRef.current.innerHTML = noteState.content;
    }
  }, [noteState.content]);

  useEffect(() => {
    if (isSelected && noteContentRef.current) {
      noteContentRef.current.focus();
    }
  }, [isSelected]);

  const handleSave = async () => {

    
    await editNote({...noteState});
    setIsEdited(false);
  };

  const handleBlur = async () => {
    if (isEdited) {
      await handleSave();
    }
  };

  const handleSelect = (e) => {
    e.preventDefault();
    setSelectedNote(isSelected ? null : note);
  };

  const handleTitleInput = (e) => {
    setIsEdited(true);
    setNoteState((prev) => ({...prev, title: e.target.value}));
  };

  const handleContentInput = (e) => {
    setIsEdited(true);
    setNoteState((prev) => ({...prev, content: e.target.innerHTML}));
  };

  const handleDeleteNote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await removeNote(note);
  };

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
                  onChange={handleTitleInput}
                  onBlur={handleBlur}
                  value={noteState.title}
                  disabled={isLoading}
              />
          )}

          <div
              className="note-content"
              ref={noteContentRef}
              contentEditable={isSelected && !isLoading}
              suppressContentEditableWarning
              onInput={handleContentInput}
              onBlur={handleBlur}
          />
        </div>

        {isSelected && (
            <div className="function-bar">
              <button
                  onClick={handleDeleteNote}
                  className="delete-btn"
                  type="button"
                  disabled={isLoading}
              >
                Delete
              </button>
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
              {isEdited && (
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                      }}
                      className="save-btn"
                      type="button"
                      disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
              )}
            </div>
        )}
      </div>
      </div>
  );
};

export default NoteCard;
