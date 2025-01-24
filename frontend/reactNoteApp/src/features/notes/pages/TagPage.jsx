import { useContext } from "react";
import { SideNavContext } from "../../../context/SideNavContext";
import NoteCard from "../components/NoteCard";
import useNote from "../hooks/useNote";

const TagPage = () => {
  const { tagNotes, isLoading, error } = useNote();
  const { isSideNavOpen } = useContext(SideNavContext);

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
        {tagNotes?.map((note) => (
          <div key={note.id} className="note-div">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagPage;
