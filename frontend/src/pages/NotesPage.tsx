import "../styles/Notespage.css";
import NoteCard from "../components/NoteCard.tsx";
import useNote from "../hooks/useNote.tsx";
import { useEffect } from "react";
import { useSideNav } from "../hooks/useSideNav.tsx";
import AddNoteCard from "../components/AddNoteCard.tsx";
import { UserNote, UserNoteData } from "types/types.ts";
import noNotes from "./../../assets/No_Note.png";
const NotesPage = () => {
  const { pinnedNotes, otherNotes, isLoading, error } = useNote();
  const { isSideNavOpen } = useSideNav();
  useEffect(() => {
    console.log("this is the pinned notes", pinnedNotes);
  }, [pinnedNotes]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  
  if (pinnedNotes.length < 1 && otherNotes.length < 1) {
    return (
      <>
        <img
          src={noNotes}
          style={{ width: "100%", height: "auto" }}
          className="no-notes"
          alt="No notes"
        />
      </>
    );
  }
  return (
    <div className="container">
      <AddNoteCard />

      {pinnedNotes?.length > 0 && (
        <>
          <div className="flex-column">
            <h1 data-testid="cypress-pinnedNotes-title">Pinned Notes</h1>
          </div>

          <div
            className="pinned-notes"
            style={{ maxWidth: isSideNavOpen ? "1200px" : "1360px" }}
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
