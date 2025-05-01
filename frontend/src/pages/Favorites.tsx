import NoteCard from "../components/NoteCard.tsx";
import useNote from "../hooks/useNote.tsx";
import { useSideNav } from "../hooks/useSideNav.tsx";
import { UserNote, UserNoteData } from "types/index.ts";
import { Link } from "react-router";
import noFavoriteNotes from "./../../assets/No_favorited_notes.png";

const Favorite = () => {
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
              <Link key={note.id} to={`/favorite/${note.id}`}>
                <NoteCard note={note} route={"/favorite"} />
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Favorite;
