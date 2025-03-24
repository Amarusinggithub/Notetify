/* eslint-disable react/prop-types */
import "../styles/NoteCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import React, { useEffect, useState } from "react";
import useNote from "../hooks/useNote.tsx";
import {
  faXmark,
  faThumbTack,
  faStar,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import NoteContentEditor from "./NoteContentEditor.tsx";
import { UserNote, UserNoteData } from "types/types.ts";

type NoteCardProps = { note: UserNote | UserNoteData };

const NoteCard = ({ note }: NoteCardProps) => {
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
  const [noteState, setNoteState] = useState<UserNote | UserNoteData>(note);

  const isSelected = selectedNote && selectedNote.id === note.id;

  const [isEdited, setIsEdited] = useState<boolean>(false);

  useEffect(() => {
    setNoteState(note);
    console.log("this is the user note", note);
    setIsEdited(false);
  }, [note]);

  const handleSave = async () => {
    if (isEdited) {
      console.log("sent edited content to server");
      await editNote(noteState);
    }
    setIsEdited(false);
  };

  const handleSelect = async (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    await handleSave();
    setSelectedNote(isSelected ? null : note);
  };

  const isUserNote = (note: UserNote | UserNoteData): note is UserNote => {
    return (note as UserNote).note !== undefined;
  };

  const handleTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setNoteState((prev) => {
      if (isUserNote(prev)) {
        return {
          ...prev,
          note: {
            ...prev.note,
            title: newTitle,
          },
        };
      } else {
        return {
          ...prev,
          note_data: {
            ...prev.note_data,
            title: newTitle,
          },
        };
      }
    });
    setIsEdited(
      isUserNote(noteState)
        ? newTitle !== noteState.note?.title
        : newTitle !== noteState.note_data?.title
    );
  };

  const handleContentInput = (newContent: string) => {
    setNoteState((prev) => {
      if (isUserNote(prev)) {
        return {
          ...prev,
          note: {
            ...prev.note,
            content: newContent,
          },
        };
      } else {
        return {
          ...prev,
          note_data: {
            ...prev.note_data,
            content: newContent,
          },
        };
      }
    });
    console.log("is edited maybe set to true");
    setIsEdited(
      isUserNote(noteState)
        ? newContent !== noteState.note?.content
        : newContent !== noteState.note_data?.content
    );
  };

  const handleDeleteNote = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    await removeNote(note);
  };

  return (
    <div
      className={isSelected ? "notecard-bg" : ""}
      onClick={(e) => {
        handleSelect(e);
      }}
    >
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

            {noteState.is_trashed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(e);
                }}
                className="delete-note-btn"
              >
                <FontAwesomeIcon
                  icon={faTrashCan}
                  className="note-trash-icon"
                />
              </button>
            )}

            {noteState.is_archived == false &&
              noteState.is_trashed == false && (
                <div className="pin-favorite-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePin(note);
                    }}
                    className="note-pin-btn"
                    style={{ display: isSelected ? "flex" : "" }}
                  >
                    <FontAwesomeIcon icon={faThumbTack} className="pin-icon" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(note);
                    }}
                    className="note-favorite-btn"
                    style={{ display: isSelected ? "flex" : "" }}
                  >
                    <FontAwesomeIcon icon={faStar} className="favorite-icon" />
                  </button>
                </div>
              )}
          </div>
          {!isSelected && (
            <div className="note-title">
              {isUserNote(noteState)
                ? noteState.note?.title || "Untitled Note"
                : noteState.note_data?.title || "Untitled Note"}
            </div>
          )}

          {isSelected && (
            <input
              className="note-title"
              onChange={(e) => {
                handleTitleInput(e);
              }}
              value={
                isUserNote(noteState)
                  ? noteState.note?.title || "Untitled Note"
                  : noteState.note_data?.title || "Untitled Note"
              }
              disabled={isLoading}
            />
          )}
          <NoteContentEditor
            content={
              isUserNote(noteState)
                ? noteState.note?.content
                : noteState.note_data?.content
            }
            handleContentInput={handleContentInput}
            isSelected={isSelected}
            note={noteState}
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
