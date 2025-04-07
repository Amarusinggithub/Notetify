import NoteCard from "../components/NoteCard.tsx";
import useNote from "../hooks/useNote.tsx";
import { useSideNav } from "../hooks/useSideNav.tsx";
import { UserNote, UserNoteData } from "types/types.ts";

import noFavoriteNotes from "./../../assets/No_Favorited_Notes.png";

const FavoritesPage = () => {
  const { isSideNavOpen } = useSideNav();

  const { favorites, isLoading, isError } = useNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (favorites.length < 1) {
    return (
      <>
        <img
          src={noFavoriteNotes}
          style={{ width: "100%", height: "auto" }}
          className="no-notes"
          alt="No favorited notes"
        />
      </>
    );
  }

  if (isError) {
    return <div>Error: {isError.message}</div>;
  }
  return (
    <div className="container">
      <div
        className="all-notes"
        style={{ maxWidth: isSideNavOpen ? "1200px" : "1400px" }}
      >
        {favorites &&
          favorites.map((note: UserNote | UserNoteData) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
