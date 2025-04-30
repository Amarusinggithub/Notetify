import useNote from "../hooks/useNote.tsx";
import NoteCard from "../components/NoteCard.tsx";
import { useSideNav } from "../hooks/useSideNav.tsx";
import { UserNote, UserNoteData } from "types/types.ts";
import noTrashedNotes from "./../../assets/No_trashed_notes.png";
import { Link } from "react-router";

const Trash = () => {
  const { isSideNavOpen } = useSideNav();

  const { trashed, isLoading, isError } = useNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {isError.message}</div>;
  }

  if (trashed.length < 1) {
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
        {trashed &&
          trashed.map((note: UserNote | UserNoteData) => (
            <div key={note.id} className="note-div">
              <Link key={note.id} to={`/trash/${note.id}`}>
                <NoteCard note={note} route={"/trash"} />
              </Link>{" "}
            </div>
          ))}
      </div>
    </div>
  );
};
export default Trash;
