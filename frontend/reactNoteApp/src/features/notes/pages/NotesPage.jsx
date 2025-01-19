import "../styles/Notespage.css";
import NoteCard from "../components/NoteCard.jsx";
import useNote from "../hooks/useNote.jsx";

const NotesPage = () => {
  const { pinnedNotes, filteredNotes, isLoading, error } = useNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container">

      
     
      {pinnedNotes?.length > 0 && (
        <div className="pinned-notes">
          <h2>Pinned</h2>
          {pinnedNotes.map((note) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
        </div>
      )}

      
      <div className="all-notes">
        <h2>Others</h2>
        {filteredNotes?.map((note) => (
          <div key={note.id} className="note-div">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
