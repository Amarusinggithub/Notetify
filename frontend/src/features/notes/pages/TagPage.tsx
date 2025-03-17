import { useContext } from "react";
import { SideNavContext } from "../../../context/SideNavContext.tsx";
import NoteCard from "../components/NoteCard.tsx";
import useNote from "../hooks/useNote.tsx";

interface UserNote {
  id: number;
  note: {
    id: number;
    title: string;
    content: string;
    users: number[];
  };
  user: number;
  tags: number[];
  is_pinned: boolean;
  is_trashed: boolean;
  is_archived: boolean;
  is_favorited: boolean;
  role: string;
}

interface UserNoteData {
  id: number;
  note_data: {
    title: string;
    content: string;
    users: number[];
  };
  tags: number[];
  is_pinned: boolean;
  is_trashed: boolean;
  is_archived: boolean;
  is_favorited: boolean;
  role: string;
}

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
        {tagNotes?.map((note:UserNote|UserNoteData) => (
          <div key={note.id} className="note-div">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagPage;
