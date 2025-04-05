import { UserNote, UserNoteData } from "types/types";
import NoteCard from "../components/NoteCard";
import useNote from "../hooks/useNote";

import noArchivedNotes from "./../../assets/No_Archive_notes.png";

const ArchivePage = () => {
  const { archiveNotes, isLoading, error } = useNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (archiveNotes.length < 1) {
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

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="container">
      <div className="all-notes">
        {archiveNotes &&
          archiveNotes.map((note: UserNote | UserNoteData) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ArchivePage;
