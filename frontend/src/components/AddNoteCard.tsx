import React, { useEffect, useRef, useState } from "react";
import useNote from "../hooks/useNote";
import "../styles/AddNoteCard.css";
import NoteContentEditor from "./Editor/components/NoteContentEditor";
import { UserNoteData } from "types";

const AddNoteCard = () => {
  const { addNote, isLoading, data } = useNote();
  const cardRef = useRef<HTMLDivElement>(null);
  let noteId;
  if (data.length > 0) {
    noteId = data[data.length - 1].id + 1;
  } else {
    noteId = 1;
  }

  const [noteState, setNoteState] = useState<UserNoteData>({
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
    role: "Admin",
  });

  const [isEdited, setIsEdited] = useState(false);
  const [isSelected, setSelected] = useState(false);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        isSelected &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        handleSelect(e as any);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [isSelected]);

  useEffect(() => {
    setIsEdited(false);
    console.log(isSelected);
  }, [isSelected]);

  const handleSelect = async (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
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
        role: "Admin",
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

  const handleContentInput = (newContent: string) => {
    setNoteState((prev) => ({
      ...prev,
      note_data: { ...prev.note_data, content: newContent },
    }));
    setIsEdited(newContent !== null && newContent !== "");
  };

  return (
    <div className={isSelected ? "notecard-bg" : ""}>
      <div
        ref={cardRef}
        className={`add-note-card ${isSelected ? "selected-note" : ""}`}
        onClick={(e) => {
          if (!isSelected) {
            handleSelect(e);
          }
        }}
      >
        <div className="note">
          <input
            className="note-title"
            placeholder={isSelected ? "Enter title here" : "Add note here"}
            onChange={handleTitle}
            value={noteState.note_data.title}
            disabled={!isSelected}
          />

          {isSelected && (
            <NoteContentEditor
              content={noteState.note_data.content}
              handleContentInput={handleContentInput}
              isSelected={isSelected}
              note={{ ...noteState }}
            />
          )}
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
