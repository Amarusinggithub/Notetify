import "../styles/Notespage.css";
import NoteCard from "../components/NoteCard.jsx";
import useNote from "../hooks/useNote.jsx";
import { useContext } from "react";
import { SideNavContext } from "../../../context/SideNavContext.jsx";
import AddNoteCard from "../components/AddNoteCard.jsx";

const NotesPage = () => {
  const { pinnedNotes, otherNotes, isLoading, error } = useNote();
  const { isSideNavOpen } = useContext(SideNavContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container">

      <AddNoteCard/>

      {pinnedNotes?.length > 0 && (
        <>
          <div className="flex-column">
            <h1>Pinned Notes</h1>
          </div>

          <div
            className="pinned-notes"
            style={{ maxWidth: isSideNavOpen ? "1200px" : "1400px" }}
          >
            {pinnedNotes.map((note) => (
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
        {otherNotes?.map((note) => (
          <div key={note.id} className="note-div">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
