import NoteCard from "../components/NoteCard";
import useNote from "../hooks/useNote";

const ArchivePage = () => {
  const { archiveNotes, isLoading, error } = useNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="container">
      <div className="all-notes">
        {archiveNotes &&
          archiveNotes.map((note) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} />
            </div>
          ))}
      </div>
    </div>
  );
}

export default ArchivePage;