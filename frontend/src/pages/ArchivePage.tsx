import { UserNote, UserNoteData } from "types/types";
import NoteCard from "../components/NoteCard";
import useNote from "../hooks/useNote";

import noArchivedNotes from "./../../assets/No_Archive_notes.png";

const ArchivePage = () => {
  const { archived, isLoading, isError } = useNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (archived.length < 1) {
    return (
      <>
        <img
          src={noArchivedNotes}
          style={{ width: "100%", height: "auto" }}
          className="no-notes"
          alt="No archived notes"
        />
      </>
    );
  }

  if (isError) {
    return <div>Error: {isError.message}</div>;
  }
  return (
    <div className="container">
      <div className="all-notes">
        {archived &&
          archived.map((note: UserNote | UserNoteData) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ArchivePage;
