import "../styles/Notespage.css";
import NoteCard from "../components/NoteCard.tsx";
import useNote from "../hooks/useNote.tsx";
import React,{ useContext, useEffect } from "react";
import { SideNavContext } from "../../../context/SideNavContext.tsx";
import AddNoteCard from "../components/AddNoteCard.tsx";


interface UserNote {
  id: number;
  note: {
    id: number;
    title: string;
    content: string;
    users: number[];
  };
  user: number;
  tags: number[];
  is_pinned: boolean;
  is_trashed: boolean;
  is_archived: boolean;
  is_favorited: boolean;
  role: string;
}

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
  role: string;
}

const NotesPage = () => {
  const { pinnedNotes, otherNotes, isLoading, error } = useNote();
  const { isSideNavOpen } = useContext(SideNavContext);
  useEffect(() => {
    console.log("this is the pinned notes", pinnedNotes);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container">
      <AddNoteCard />

      {pinnedNotes?.length > 0 && (
        <>
          <div className="flex-column">
            <h1>Pinned Notes</h1>
          </div>

          <div
            className="pinned-notes"
            style={{ maxWidth: isSideNavOpen ? "1200px" : "1400px" }}
          >
            {pinnedNotes.map((note: UserNote | UserNoteData) => (
              <div key={note.id} className="note-div">
                <NoteCard note={note} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex-column">
        <h1>Others</h1>
      </div>

      <div
        className="all-notes"
        style={{ maxWidth: isSideNavOpen ? "1200px" : "1400px" }}
      >
        {otherNotes?.map((note: UserNote | UserNoteData) => (
          <div key={note.id} className="note-div">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
