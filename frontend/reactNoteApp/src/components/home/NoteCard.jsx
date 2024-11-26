import "../../styles/NoteCard.css";
import {useContext, useEffect, useRef, useState} from "react";
import {deleteNote, updateNote} from "../../services/NoteService.jsx";
import NoteContext from "../../context/NoteContext.jsx";

const NoteCard = ({note}) => {
  const noteRef = useRef(null);
  const {selectedNote, setSelectedNote} = useContext(NoteContext);
  const isSelected = selectedNote && selectedNote.id === note.id;
  const [noteState, setNoteState] = useState({
    title: note.title,
    content: note.content,
    id: note.id,
    is_favorite: note.is_favorite,
    is_pinned: note.is_pinned,
    in_recycleBin: note.in_recycleBin,
    date_created: note.date_created,
    last_updated: note.last_updated,
  });
  const isEditedRef = useRef(false);


  useEffect(() => {
    console.log("NoteState changed:", noteState);
  }, [noteState]);

  useEffect(() => {
    console.log("NoteState changed:", isEditedRef);
  }, [isEditedRef]);


  useEffect(() => {
    if (isSelected && noteRef.current) {
      noteRef.current.focus();
    }
  }, [isSelected]);

  const handleBlur = async (e) => {
    e.preventDefault();

    if (isEditedRef.current) {
      try {
        const response = await updateNote(noteState);
        if (response === 200) {
          console.log("Note was updated successfully");
        } else {
          console.log("Note was not updated successfully");
        }
      } catch (error) {
        console.error("Error updating note", error);
      } finally {
        isEditedRef.current = false;
      }
    }
  };

  const handleSelect = async (event) => {
    event.preventDefault();
    setSelectedNote(isSelected ? null : note);
  };

  const handleTitleInput = (e) => {
    console.log("Title input changed:", e.target.innerText);
    setNoteState({...noteState, title: e.target.innerText});
    isEditedRef.current = true;
  };

  const handleContentInput = (e) => {
    console.log("Content input changed:", e.target.innerText);
    setNoteState({...noteState, content: e.target.innerText});
    isEditedRef.current = true;
  };


  const handleDeleteNote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await deleteNote(note);
      if (response === 200) {
        console.log("Note was deleted successfully");
        setSelectedNote(null);
      } else {
        console.log("Note was not deleted successfully");
      }
    } catch (error) {
      console.error("There was an error deleting the note", error);
    }
  };

  return (
      <div
          className={`${isSelected ? "notecard-bg" : ""}`}
          onClick={(e) => handleSelect(e)}
      >
        <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isSelected) {
                handleSelect(e);
              }
            }}
            className={`note-card ${isSelected ? "selected-note" : ""}`}
        >
          <div ref={noteRef} contentEditable={isSelected}
               suppressContentEditableWarning={true} className={"note"}>
            <div
                className={"note-title"}
                onInput={handleTitleInput}
                onBlur={handleBlur}
            >
              {noteState.title}
            </div>
            <div
                className={"note-content"}
                onInput={handleContentInput}
                onBlur={handleBlur}
            >
              {noteState.content}
            </div>
          </div>
          {isSelected && (
              <div className={"function-bar"}>
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