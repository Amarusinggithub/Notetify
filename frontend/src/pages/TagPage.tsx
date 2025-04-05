import { UserNote, UserNoteData } from "types/types.ts";
import { useSideNav } from "../hooks/useSideNav.tsx";
import NoteCard from "../components/NoteCard.tsx";
import useNote from "../hooks/useNote.tsx";
import noTaggedNotes from "./../../assets/No_tagged_Notes.png";

const TagPage = () => {
  const { tagNotes, isLoading, error } = useNote();
  const { isSideNavOpen } = useSideNav();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (tagNotes.length < 1) {
    return (
      <>
        <img
          src={noTaggedNotes}
          style={{ width: "100%", height: "auto" }}
          className="no-notes"
          alt="No Tagged notes"
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
        {tagNotes?.map((note: UserNote | UserNoteData) => (
          <div key={note.id} className="note-div">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagPage;
