import React, { useEffect, useState } from "react";
import useNote from "../hooks/useNote";
import "../styles/AddNoteCard.css";
import NoteContentEditor from "./NoteContentEditor";




interface UserNoteData {
  id: number;
  note_data: {
    title: string;
    content: string;
    users: number[];
  };
  tags: number[];
  is_pinned: boolean;
  is_trashed: boolean;
  is_archived: boolean;
  is_favorited: boolean;
}


const AddNoteCard = () => {
  const { addNote, isLoading, error, notes } = useNote();
  let noteId;
  if (notes.length > 0) {
    noteId = notes[notes.length - 1].id + 1;
  } else {
    noteId = 1;
  }


  
  const [noteState, setNoteState] = useState<UserNoteData>({
    id:noteId,
    note_data: {
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

  const [isEdited, setIsEdited] = useState(false);
  const [isSelected, setSelected] = useState(false);

  useEffect(() => {
    setIsEdited(false);
  }, [isSelected]);

  const handleSelect = async (e:
        | React.MouseEvent<HTMLButtonElement, MouseEvent>
        | React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    if (isSelected) {
      if (isEdited) {
        await handleSave();
      }

      setSelected(false);
    } else {
      setNoteState({
        id: noteId,
        note_data: {
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

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setNoteState((prev) => ({
      ...prev,
      note_data: { ...prev.note_data, title: newTitle },
    }));
    setIsEdited(newTitle !== null && newTitle !== "");
  };

  const handleContentInput = (newContent:string) => {
    setNoteState((prev) => ({ ...prev, note_data: {  ...prev.note_data,content: newContent } }));
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
              value={noteState.note_data.title}
              disabled={isLoading}
            />
          )}

          <NoteContentEditor
            content={noteState.note_data.content}
            handleContentInput={handleContentInput}
            isSelected={isSelected}
            note={{ ...noteState }}
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
