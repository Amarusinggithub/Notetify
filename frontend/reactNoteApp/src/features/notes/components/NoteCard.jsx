/* eslint-disable react/prop-types */

import "../styles/NoteCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useState } from "react";
import useNote from "../hooks/useNote.jsx";
import {
  faXmark,
  faThumbTack,
  faStar,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import NoteContentEditor from "./NoteContentEditor.jsx";

const NoteCard = ({ note }) => {
  const {
    selectedNote,
    setSelectedNote,
    editNote,
    removeNote,
    isLoading,
    handleFavorite,
    handlePin,
    error,
  } = useNote();
  const [noteState, setNoteState] = useState({ ...note });

  const isSelected = selectedNote && selectedNote.id === note.id;

  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    setNoteState({ ...note });
    setIsEdited(false);
  }, [note]);

  const handleSave = async () => {
    if (isEdited) {
      await editNote({ ...noteState });
    }
    setIsEdited(false);
  };

  const handleSelect = async (e) => {
    e.preventDefault();
    await handleSave();
    setSelectedNote(isSelected ? null : note);
  };

  const handleTitleInput = (e) => {
    const newTitle = e.target.value;
    setNoteState((prev) => ({ ...prev, title: newTitle }));
    setIsEdited(newTitle !== note.title);
  };

  const handleContentInput = (newContent) => {
    setNoteState((prev) => ({ ...prev, content: newContent }));
    setIsEdited(newContent !== note.content);
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
          <div
            className="top-function-header"
            style={{
              justifyContent: isSelected ? "space-between" : "flex-end",
            }}
          >
            {isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(e);
                }}
                className="note-close-btn"
              >
                <FontAwesomeIcon icon={faXmark} className="note-close-icon" />
              </button>
            )}

            {note.is_trashed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note);
                }}
                className="delete-note-btn"
              >
                <FontAwesomeIcon
                  icon={faTrashCan}
                  className="note-trash-icon"
                />
              </button>
            )}

            {note.is_archived == false && note.is_trashed == false && (
              <div className="pin-favorite-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePin(note);
                  }}
                  className="note-pin-btn"
                >
                  <FontAwesomeIcon icon={faThumbTack} className="pin-icon" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(note);
                  }}
                  className="note-favorite-btn"
                >
                  <FontAwesomeIcon icon={faStar} className="favorite-icon" />
                </button>
              </div>
            )}
          </div>
          {!isSelected && <div className="note-title">{noteState.title}</div>}

          {isSelected && (
            <input
              className="note-title"
              onChange={handleTitleInput}
              value={noteState.title}
              disabled={isLoading}
            />
          )}

          <NoteContentEditor
            content={noteState.content}
            handleContentInput={handleContentInput}
            isSelected={isSelected}
            note={note}
          />
        </div>

        {isSelected && (
          <div className="function-bar">
            <button
              onClick={(e) => {
                handleSelect(e);
              }}
              className="note-save-btn"
              type="button"
              disabled={isLoading}
            >
              {"Close"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
