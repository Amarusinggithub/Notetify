import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../services/NoteService";
import { Tag, UserNote, UserNoteData } from "./../types/types";
import { isUserNote } from "./../utils/helpers";
import {
  useQuery,
  useMutation,
  useQueryClient,
  
} from "@tanstack/react-query";
interface NoteContextType {
  search: string;
  title: string;
  searchNotes: (UserNote | UserNoteData)[];
  selectedNote: UserNote | null;
  isLoading: boolean;
  tagNotes: (UserNote | UserNoteData)[];
  isError: any;
  pinned: (UserNote | UserNoteData)[];
  favorites: (UserNote | UserNoteData)[];
  archived: (UserNote | UserNoteData)[];
  trashed: (UserNote | UserNoteData)[];
  filtered: (UserNote | UserNoteData)[];
  other: (UserNote | UserNoteData)[];
  data: (UserNote | UserNoteData)[];
  setTagNotes: React.Dispatch<
    React.SetStateAction<(UserNote | UserNoteData)[]>
  >;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  addNote: (note: UserNoteData) => Promise<void>;
  editNote: (newNote: UserNote) => Promise<void>;
  removeNote: (note: UserNote) => Promise<void>;
  handleArchive: (note: UserNote) => void;
  handleFavorite: (note: UserNote) => void;
  handleTrash: (note: UserNote) => void;
  handlePin: (note: UserNote) => void;
  setSelectedNote: React.Dispatch<React.SetStateAction<UserNote | null>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;

  handleTagClick: (tag: Tag) => void;
}

type NoteProviderProps = PropsWithChildren;

const NoteContext = createContext<NoteContextType | undefined>(undefined);

// Categorize notes based on various flags.
const categorizedNotes = (notesArray: (UserNote | UserNoteData)[]) => {
  const pinned: (UserNote | UserNoteData)[] = [];
  const favorites: (UserNote | UserNoteData)[] = [];
  const archived: (UserNote | UserNoteData)[] = [];
  const trashed: (UserNote | UserNoteData)[] = [];
  const filtered: (UserNote | UserNoteData)[] = [];
  const other: (UserNote | UserNoteData)[] = [];

  notesArray.forEach((note: UserNote | UserNoteData) => {
    if (note.is_pinned && !note.is_trashed && !note.is_archived) {
      pinned.push(note);
    }
    if (note.is_favorited && !note.is_trashed && !note.is_archived) {
      favorites.push(note);
    }
    if (note.is_archived && !note.is_trashed) {
      archived.push(note);
    }
    if (note.is_trashed && !note.is_archived) {
      trashed.push(note);
    }
    if (!note.is_trashed && !note.is_archived && !note.is_pinned) {
      filtered.push(note);
      other.push(note);
    }
  });

  return { pinned, favorites, archived, trashed, filtered, other };
};

const NoteProvider = ({ children }: NoteProviderProps) => {
  const token = localStorage.getItem("access_token");

  const queryClient = useQueryClient();
  const { data = [], isError, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
    enabled: !!token,
  });

  const { pinned, favorites, archived, trashed, filtered, other } =
    useMemo(() => {
      return categorizedNotes(data);
    }, [data]);


  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("Notes");
  const [tagNotes, setTagNotes] = useState<(UserNote | UserNoteData)[]>([]);
  const [searchNotes, setSearchNotes] = useState<(UserNote | UserNoteData)[]>([]);
  const [selectedNote, setSelectedNote] = useState<UserNote | null>(null);

  const handleSearch = () => {
    const query = search.trim().toLowerCase();
    let sourcedNotes: (UserNote | UserNoteData)[] = [];
    switch (title) {
      case "Notes":
        sourcedNotes = [...other, ...pinned];
        break;
      case "Favorites":
        sourcedNotes = favorites;
        break;
      case "Archive":
        sourcedNotes = archived;
        break;
      case "Trash":
        sourcedNotes = trashed;
        break;
      default:
        sourcedNotes = tagNotes;
        break;
    }

    const filteredNotes = sourcedNotes.filter((note) =>
      isUserNote(note)
        ? note.note.title.toLowerCase().includes(query)
        : note.note_data.title.toLowerCase().includes(query)
    );

    setSearchNotes(filteredNotes);
  };

  const handleTagClick = (tag: Tag) => {
    setTagNotes(
      data.filter(
        (note: UserNote | UserNoteData) =>
          note.tags.includes(tag.id!) && !note.is_trashed && !note.is_archived
      )
    );
  };

  const handleFavorite = (note: UserNote) => {
    const updatedNote = { ...note, is_favorited: !note.is_favorited };
    editNote(updatedNote);
  };

  const handleTrash = (note: UserNote) => {
    const updatedNote = { ...note, is_trashed: !note.is_trashed };
    editNote(updatedNote);
  };

  const handleArchive = (note: UserNote) => {
    const updatedNote = { ...note, is_archived: !note.is_archived };
    editNote(updatedNote);
  };

  const handlePin = (note: UserNote) => {
    const updatedNote = { ...note, is_pinned: !note.is_pinned };
    editNote(updatedNote);
  };

  const addNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const addNote = async (note: UserNoteData) => {
    addNoteMutation.mutate(note);
  };

  const editNoteMutation = useMutation({
    mutationFn: updateNote,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const editNote = async (note: UserNote) => {
    editNoteMutation.mutate(note);
  };

  const removeNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const removeNote = async (note: UserNote) => {
    removeNoteMutation.mutate(note);
  };

  return (
    <NoteContext.Provider
      value={{
        search,
        pinned,
        favorites,
        archived,
        trashed,
        filtered,
        other,
        title,
        searchNotes,
        selectedNote,
        isLoading,
        tagNotes,
        isError,data,
        setTagNotes,
        setTitle,
        handleSearch,
        addNote,
        editNote,
        removeNote,
        handleArchive,
        handleFavorite,
        handleTrash,
        handlePin,
        setSelectedNote,
        setSearch,
        handleTagClick,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

const useNote = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNote must be used within a NoteProvider");
  }
  return context;
};

export { NoteContext, NoteProvider };
export default useNote;
