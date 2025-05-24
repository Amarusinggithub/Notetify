import "../styles/Notespage.css";
import NoteCard from "../components/NoteCard.tsx";
import useNote from "../hooks/useNote.tsx";
import { useEffect } from "react";
import { useSideNav } from "../hooks/useSideNav.tsx";
import AddNoteCard from "../components/AddNoteCard.tsx";
import { UserNote, UserNoteData } from "types/index.ts";
import noNotes from "./../../assets/No_Note.png";

const Home = () => {
  const { pinned, other, isLoading, isError } = useNote();
  const { isSideNavOpen } = useSideNav();
  useEffect(() => {
  }, [pinned]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {isError.message}</div>;
  }

  if (pinned.length < 1 && other.length < 1) {
    return (
      <div>
        <AddNoteCard />

        <img
          src={noNotes}
          style={{ width: "100%", height: "auto" }}
          className="no-notes"
          alt="No notes"
        />
      </div>
    );
  }
  return (
    <div className="container">
      <AddNoteCard />

      {pinned?.length > 0 && (
        <>
          <div className="flex-column">
            <h1 data-testid="cypress-pinnedNotes-title">Pinned Notes</h1>
          </div>

          <div
            className="pinned-notes"
            style={{ maxWidth: isSideNavOpen ? "1200px" : "1360px" }}
          >
            {pinned.map((note: UserNote | UserNoteData) => (
              <div key={note.id} className="note-div">
                  <NoteCard note={note} route={"/"} />
              
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
        {other?.map((note: UserNote | UserNoteData) => (
              <NoteCard note={note} route={"/"} />
        ))}
      </div>
    </div>
  );
};

export default Home;
