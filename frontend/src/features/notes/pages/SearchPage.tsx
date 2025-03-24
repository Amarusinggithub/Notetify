import NoteCard from "../components/NoteCard";
import useNote from "../hooks/useNote";
import { useSideNav } from "../../../context/SideNavContext";
import { UserNote, UserNoteData } from "types/types";



const SearchPage = () => {
  const { searchNotes, isLoading, error } = useNote();
  const { isSideNavOpen } = useSideNav();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div
        className="all-notes"
        style={{ maxWidth: isSideNavOpen ? "1200px" : "1400px" }}
      >
        {searchNotes?.map((note:UserNote|UserNoteData) => (
          <div key={note.id} className="note-div">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
