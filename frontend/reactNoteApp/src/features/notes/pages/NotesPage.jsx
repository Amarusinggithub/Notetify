import "../styles/Notespage.css";
import NoteCard from "../components/NoteCard.jsx";
import useNote from "../hooks/useNote.jsx";

const NotesPage = () => {
  const { pinnedNotes, otherNotes, isLoading, error } = useNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container">
      {pinnedNotes?.length > 0 && (
        <>
          <div className="flex-column">
            <h1>Pinned Notes</h1>
          </div>

          <div className="pinned-notes">
            {pinnedNotes.map((note) => (
              <div key={note.id} className="note-div">
                <NoteCard note={note} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex-column">
        <h1>Others</h1>
      </div>

      <div className="all-notes">
        {otherNotes?.map((note) => (
          <div key={note.id} className="note-div">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
