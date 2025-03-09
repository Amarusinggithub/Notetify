import { useEffect, useRef, useState } from "react";
import useNote from "../hooks/useNote";

const AddNoteCard=()=>{
    const {addNote,isLoading,error,}=useNote();
    const [noteState, setNoteState] = useState({
      title: "",
      content: "",
      is_favorite: false,
      is_pinned: false,
      is_trashed: false,
      is_archived: false,
    });

    const [isEdited, setIsEdited] = useState(false);
    const [isSelected,setSelected]=useState();
    const noteContentRef = useRef(null);
    

    useEffect(() => {
          if (noteContentRef.current) {
            noteContentRef.current.innerHTML = noteState.content;
          }
        }, [noteState.content]);
      
        useEffect(() => {
          if (isSelected && noteContentRef.current) {
            noteContentRef.current.focus();
          }
        }, [isSelected]);
      

    const handleSelect = (e) => {
      e.preventDefault();

      setSelected(isSelected ? false : true);
      if(isSelected===false){
        setNoteState();

      }

    };

     const handleSave = async () => {
       await addNote({ ...noteState });
     };

     

     const handleTitle = (e) => {
       setNoteState((prev) => ({ ...prev, title: e.target.value }));
       setIsEdited(true);
     };

     const handleContent = (e) => {
       setNoteState((prev) => ({ ...prev, content: e.target.innerHTML }));
        setIsEdited(true);
     };

    if(isLoading){
       return  <div>Loading</div>;
    }

    if(error){
      return  <div>Error:{error.message} </div>;
    }
   
    return (
      <div className={isSelected ? "notecard-bg" : ""} onClick={handleSelect}>
        <div
          className={`note-card ${isSelected ? "selected-note" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isSelected) {
              handleSelect(e);
            }
          }}
        >
          {error && <div className="error-banner">{error}</div>}

          <div className="note">
            {!isSelected && <div className="note-title">{noteState.title}</div>}

            {isSelected && (
              <input
                className="note-title"
                onChange={handleTitle}
                value={noteState.title}
                disabled={isLoading}
              />
            )}

            <textarea
              className="note-content"
              ref={noteContentRef}
              value={noteState.content}
              onChange={handleContent}
            />
          </div>

          {isSelected && (
            <div className="function-bar">
             
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(e);
                }}
                className="close-btn"
                type="button"
                disabled={isLoading}
              >
                Close
              </button>
              {isEdited && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="save-btn"
                  type="button"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
}

export default AddNoteCard;