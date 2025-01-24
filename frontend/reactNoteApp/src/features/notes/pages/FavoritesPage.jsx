import { useContext } from "react";
import NoteCard from "../components/NoteCard.jsx";
import useNote from "../hooks/useNote.jsx";
import { SideNavContext } from "../../../context/SideNavContext.jsx";

const FavoritesPage = () => {
  const { isSideNavOpen } = useContext(SideNavContext);

  const { favoriteNotes, isLoading, error } = useNote();

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
        {favoriteNotes &&
          favoriteNotes.map((note) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
