import useNote from "../hooks/useNote.tsx";
import NoteCard from "../components/NoteCard.tsx";
import { useSideNav } from "../hooks/useSideNav.tsx";
import { UserNote, UserNoteData } from "types/types.ts";
import noTrashedNotes from "./../../assets/No_trashed_notes.png";

const TrashPage = () => {
  const { isSideNavOpen } = useSideNav();

  const { trashNotes, isLoading, error } = useNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

   if (trashNotes.length < 1) {
    return (
      <>
        <img
          src={noTrashedNotes}
          style={{ width: "100%", height: "auto" }}
          className="no-notes"
          alt="No tagged notes"
        />
      </>
    );
  }

  return (
    <div className="container">
      <div
        className="all-notes"
        style={{ maxWidth: isSideNavOpen ? "1200px" : "1400px" }}
      >
        {trashNotes &&
          trashNotes.map((note: UserNote | UserNoteData) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
      </div>
    </div>
  );
};
export default TrashPage;
