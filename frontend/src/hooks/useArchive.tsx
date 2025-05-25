import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import {

  getNotes,
  updateNote,
} from "../lib/NoteService.ts";
import { Tag, UserNote, UserNoteData } from "../types/index.ts";
import { isUserNote } from "./../utils/helpers";
import {
  useQuery,
  useMutation,
  useQueryClient,
  RefetchOptions,
  QueryObserverResult,
} from "@tanstack/react-query";
import { useAuth } from "./useAuth.tsx";

interface NoteContextType {
  search: string;
  title: string;
  searchNotes: (UserNote | UserNoteData)[];
  selectedNote: UserNote | null;
  isLoading: boolean;
  isError: any;
  archived: (UserNote | UserNoteData)[];
  data: (UserNote | UserNoteData)[];

  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<any, Error>>;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  editNote: (newNote: UserNote) => Promise<void>;
  handleArchive: (note: UserNote) => void;
  setSelectedNote: React.Dispatch<React.SetStateAction<UserNote | null>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

type ArchiveProviderProps = PropsWithChildren;

const ArchiveContext = createContext<NoteContextType | undefined>(undefined);

const isArchiveNotes = (notesArray: (UserNote | UserNoteData)[]) => {
  const archived: (UserNote | UserNoteData)[] = [];

  for (let i = 0; i < notesArray.length; i++) {
    let note = notesArray[i];

    if (note.is_archived && !note.is_trashed) {
      archived.push(note);
    }
  }

  return { archived };
};

const ArchiveProvider = ({ children }: ArchiveProviderProps) => {
  const { isAuthenticated } = useAuth();

  const queryClient = useQueryClient();
  const {
    data = [],
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["archiveNotes"],
    queryFn: getNotes,
    enabled: isAuthenticated,
  });

  const { archived } = useMemo(() => {
    return isArchiveNotes(data);
  }, [data]);

  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("Notes");
  const [searchNotes, setSearchNotes] = useState<(UserNote | UserNoteData)[]>(
    []
  );
  const [selectedNote, setSelectedNote] = useState<UserNote | null>(null);

  const handleSearch = () => {
    const query = search.trim().toLowerCase();
    let sourcedNotes: (UserNote | UserNoteData)[] = [];
    switch (title) {
      case "Archive":
        sourcedNotes = archived;
        break;

      default:
        sourcedNotes = archived;
        break;
    }

    const filteredNotes = sourcedNotes.filter((note) =>
      isUserNote(note)
        ? note.note.title.toLowerCase().includes(query)
        : note.note_data.title.toLowerCase().includes(query)
    );
    setSearchNotes(filteredNotes);
  };

  const handleArchive = (note: UserNote) => {
    const updatedNote = { ...note, is_archived: !note.is_archived };
    editNote(updatedNote);
  };

  const editNoteMutation = useMutation({
    mutationFn: updateNote,
    onSuccess(){
      queryClient.invalidateQueries({ queryKey: ["archiveNotes"] });
    },
  });

  const editNote = async (note: UserNote) => {
    if (
      note.note.content!.trim().length != 0 &&
      note.note.title!.trim().length != 0
    )
      editNoteMutation.mutate(note);
  };

  return (
    <ArchiveContext.Provider
      value={{
        search,

        archived,

        title,
        searchNotes,
        selectedNote,
        isLoading,
        isError,
        data,
        setTitle,
        handleSearch,
        editNote,
        handleArchive,
        setSelectedNote,
        setSearch,
        refetch,
      }}
    >
      {children}
    </ArchiveContext.Provider>
  );
};

const useArchive = () => {
  const context = useContext(ArchiveContext);
  if (!context) {
    throw new Error("useArchive must be used within a ArchiveProvider");
  }
  return context;
};

export { ArchiveContext, ArchiveProvider };
export default useArchive;
