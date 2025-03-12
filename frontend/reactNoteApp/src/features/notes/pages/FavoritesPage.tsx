import React,{ useContext } from "react";
import NoteCard from "../components/NoteCard.tsx";
import useNote from "../hooks/useNote.tsx";
import { SideNavContext } from "../../../context/SideNavContext.tsx";

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
}

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
          favoriteNotes.map((note:UserNote|UserNoteData) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
