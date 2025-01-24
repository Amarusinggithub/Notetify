import useNote from "../hooks/useNote.jsx";
import NoteCard from "../components/NoteCard.jsx";
import { useContext } from "react";
import { SideNavContext } from "../../../context/SideNavContext.jsx";

const TrashPage = () => {
  const { isSideNavOpen } = useContext(SideNavContext);

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
          trashNotes.map((note) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
      </div>
    </div>
  );
};
export default TrashPage;
