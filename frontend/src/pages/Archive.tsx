import { UserNote, UserNoteData } from "types";
import NoteCard from "../components/NoteCard";
import useNote from "../hooks/useNote";
import { useVirtualizer } from "@tanstack/react-virtual";

import noArchivedNotes from "./../../assets/No_Archive_notes.png";
import { useRef } from "react";

const Archive = () => {
  const { archived, isLoading, isError } = useNote();
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: archived.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (archived.length < 1) {
    return (
      <div className="flex flex-row min-h-screen justify-center items-center ">
        <img
          src={noArchivedNotes}
          style={{ width: "100%", height: "auto" }}
          className="no-notes"
          alt="No archived notes"
        />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {isError.message}</div>;
  }
  return (
    <div ref={parentRef} className="container">
      <div className="all-notes">
        {archived &&
          archived.map((note: UserNote | UserNoteData) => (
            <div key={note.id} className="note-div">
              <NoteCard note={note} route={"/archive"} />
            </div>
          ))}

      
      </div>
    </div>
  );
};

export default Archive;
