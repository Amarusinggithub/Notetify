import NoteCard from "../components/NoteCard.jsx";
import useNote from "../hooks/useNote.jsx";

const FavoritesPage = () => {

    const {

        favoriteNotes,
        isLoading,
        error,


    } = useNote();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {    
        return <div>Error: {error.message}</div>;
    }
    return (
        <div className="container">
            <div className="notes">
                {favoriteNotes &&
                    favoriteNotes.map((note) => (
                        <div key={note.id} className="note-div">
                            <NoteCard note={note}/>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default FavoritesPage;