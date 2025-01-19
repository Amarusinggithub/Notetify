import NoteCard from "../components/NoteCard";
import useNote from "../hooks/useNote";

const SearchPage = () => { 
const {  filteredNotes } = useNote();
    return (
      <div>
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
}

export default SearchPage;