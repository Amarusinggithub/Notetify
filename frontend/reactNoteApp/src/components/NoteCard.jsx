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
    const noteContentRef = useRef(null);
    const [contentValue, setContentValue] = useState(noteState.content);


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

    useEffect(() => {
        if (noteContentRef.current) {
            noteContentRef.current.innerHTML = contentValue;
        }
    }, [contentValue]);




  useEffect(() => {
    console.log("NoteState changed:", noteState);
  }, [noteState]);

  useEffect(() => {
      console.log("NoteState changed:", isEdited);
  }, [isEdited]);

  useEffect(() => {
      if (isSelected && noteContentRef.current) {
          noteContentRef.current.focus();
    }
  }, [isSelected]);

  const handleBlur = async (e) => {
      if (isEdited) {
          setNoteState({...noteState, content: contentValue});
      try {
        const response = await updateNote(noteState);
          if (response >= 200 && response < 300) {
          console.log("Note was updated successfully");
        } else {
          console.log("Note was not updated successfully");
        }
      } catch (error) {
          console.error("Error updating note", error.response?.data || error);
      } finally {
          setIsEdited(false);
      }
    }
  };

    const handleSelect = (event) => {
    event.preventDefault();
    setSelectedNote(isSelected ? null : note);
  };

    const handleTitleInput = (e) => {
        console.log("Title input changed:", e.target.value);
        setNoteState({...noteState, title: e.target.value});
        setIsEdited(true);
    };


    const handleContentInput = (e) => {
        setContentValue(e.target.innerHTML);
        setIsEdited(true);
    };


  const handleDeleteNote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await deleteNote(note);
        if (response >= 200 && response < 300) {
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
              <div className="note">
                  {!isSelected && (
                      <div className="note-title">{noteState.title}</div>
                  )}

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
