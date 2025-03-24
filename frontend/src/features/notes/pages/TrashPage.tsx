import useNote from "../hooks/useNote.tsx";
import NoteCard from "../components/NoteCard.tsx";
import {  useSideNav } from "../../../context/SideNavContext.tsx";
import { UserNote, UserNoteData } from "types/types.ts";


const TrashPage = () => {
  const { isSideNavOpen } = useSideNav();

  const { trashNotes, isLoading, error } = useNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container">
      <div
        className="all-notes"
        style={{ maxWidth: isSideNavOpen ? "1200px" : "1400px" }}
      >
        {trashNotes &&
          trashNotes.map((note:UserNote|UserNoteData) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
      </div>
    </div>
  );
};
export default TrashPage;
