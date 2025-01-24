import NoteCard from "../components/NoteCard";
import useNote from "../hooks/useNote";

const TagPage = () => {
  const { tagNotes } = useNote();
  return (
    <div>
      <div className="all-notes">
        {tagNotes?.map((note) => (
          <div key={note.id} className="note-div">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagPage;
