import "../styles/NoteCard.css";
import {useContext, useEffect, useRef, useState} from "react";
import {deleteNote, updateNote} from "../services/NoteService.jsx";
import NoteContext from "../context/NoteContext.jsx";

const NoteCard = ({note}) => {
  const {selectedNote, setSelectedNote} = useContext(NoteContext);
  const isSelected = selectedNote && selectedNote.id === note.id;

  const [noteState, setNoteState] = useState({
    title: note.title,
    content: note.content,
    id: note.id,
    is_favorite: note.is_favorite,
    is_pinned: note.is_pinned,
    in_recycleBin: note.in_recycleBin,
  });
  const [isEdited, setIsEdited] = useState(false);
  const [contentValue, setContentValue] = useState(noteState.content);

  const noteContentRef = useRef(null);

  /**
   * Sync component state with new incoming props whenever `note` changes.
   */
  useEffect(() => {
    setNoteState({...note});
    setContentValue(note.content);
  }, [note]);

  /**
   * Keep the note's content displayed in the `contentEditable` div
   * updated with the latest `contentValue`.
   */
  useEffect(() => {
    if (noteContentRef.current) {
      noteContentRef.current.innerHTML = contentValue;
    }
  }, [contentValue]);

  /**
   * Focus on content area if the note is selected.
   */
  useEffect(() => {
    if (isSelected && noteContentRef.current) {
      noteContentRef.current.focus();
    }
  }, [isSelected]);

  /**
   * Handle blur event to update note content if it has been edited.
   */
  const handleBlur = async () => {
    if (!isEdited) return;

    try {
      // Update the noteState first so subsequent operations are consistent
      setNoteState((prevState) => ({...prevState, content: contentValue}));

      const response = await updateNote({
        ...noteState,
        content: contentValue,
      });

      if (response >= 200 && response < 300) {
        console.log("Note updated successfully");
      } else {
        console.log("Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error.response?.data || error);
    } finally {
      setIsEdited(false);
    }
  };

  /**
   * Toggle selection state of this note.
   */
  const handleSelect = (event) => {
    event.preventDefault();
    setSelectedNote(isSelected ? null : note);
  };

  /**
   * Update title in local state and set editing flag.
   */
  const handleTitleInput = (e) => {
    setIsEdited(true);
    setNoteState((prevState) => ({...prevState, title: e.target.value}));
  };

  /**
   * Update contentValue (the content displayed) and set editing flag.
   */
  const handleContentInput = (e) => {
    setIsEdited(true);
    setContentValue(e.target.innerHTML);
  };

  /**
   * Delete the note and clear selection if successful.
   */
  const handleDeleteNote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await deleteNote(note);
      if (response >= 200 && response < 300) {
        console.log("Note deleted successfully");
        setSelectedNote(null);
      } else {
        console.log("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
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
        <div className="note">
          {!isSelected && <div className="note-title">{noteState.title}</div>}

          {isSelected && (
              <input
                  className="note-title"
                  onChange={handleTitleInput}
                  onBlur={handleBlur}
                  value={noteState.title}
              />
          )}

          <div
              className="note-content"
              ref={noteContentRef}
              contentEditable={isSelected}
              suppressContentEditableWarning={true}
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
              >
                Close
              </button>
            </div>
        )}
      </div>
      </div>
  );
};

export default NoteCard;
