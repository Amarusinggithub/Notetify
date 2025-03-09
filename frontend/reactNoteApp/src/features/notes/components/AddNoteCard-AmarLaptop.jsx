import { useEffect, useState } from "react";
import useNote from "../hooks/useNote";
import "../styles/AddNoteCard.css";
import Tiptap from "./tiptapEditor";

const AddNoteCard = () => {
  const { addNote, isLoading, error, notes } = useNote();
  let noteId;
  if (notes.length > 0) {
    noteId = notes[notes.length - 1].id + 1;
  } else {
    noteId = 1; 
  }
  const [noteState, setNoteState] = useState({
    note: {
      title: "",
      content: "",
      users: [],
    },
    tags:[],
    is_pinned:false,
    is_trashed: false,
    is_archived: false,
    is_favorited: false,
  });

  const [isEdited, setIsEdited] = useState(false);
  const [isSelected, setSelected] = useState(false);

  useEffect(() => {
    setIsEdited(false);
  }, [isSelected]);

  const handleSelect = async (e) => {
    e.preventDefault();
    if (isSelected) {
      if (isEdited) {
        await handleSave();
      }

      setSelected(false);
    } else {
      setNoteState({
        note: {
          title: "",
          content: "",
          users: [],
        },
        tags: [],
        is_pinned: false,
        is_trashed: false,
        is_archived: false,
        is_favorited: false,
      });
      setSelected(true);
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
          {isSelected && (
            <input
              className="note-title"
              placeholder="Enter title here"
              onChange={handleTitle}
              value={noteState.note.title}
              disabled={isLoading}
            />
          )}

          <Tiptap
            content={noteState.note.content}
            handleContentInput={handleContentInput}
            isSelected={isSelected}
            noteId={noteId}
          />
        </div>

        {isSelected && (
          <div className="function-bar">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isSelected) {
                  handleSelect(e);
                }
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
