import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  createTag,
  deleteTag,
  getTags,
  updateTag,
} from "../services/TagService.ts";
import { Tag } from "types/types.ts";




interface TagContextType {
  selectedTag: Tag | null;
  isLoading: boolean;
  error: string | null;
  tags: Tag[];
  wantToDeleteTag: boolean;
  wantToEditTag: boolean;
  setSelectedTag: React.Dispatch<React.SetStateAction<Tag | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  setWantToDeleteTag: React.Dispatch<React.SetStateAction<boolean>>;
  setWantToEditTag: React.Dispatch<React.SetStateAction<boolean>>;
  fetchTags: () => Promise<void>;
  makeTag: (tagName: string) => Promise<void>;
  editTag: (tag: Tag) => Promise<void>;
  removeTag: (tag: Tag) => Promise<void>;
}

type TagProviderProps=PropsWithChildren;

const TagContext = createContext<TagContextType|undefined>(undefined);

const TagProvider = ({ children }: TagProviderProps) => {
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [wantToDeleteTag, setWantToDeleteTag] = useState<boolean>(false);
  const [wantToEditTag, setWantToEditTag] = useState<boolean>(false);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTags = await getTags();
      setTags(fetchedTags);
    } catch (e: any) {
      setError(e.message || "Error fetching tags");
    } finally {
      setLoading(false);
    }
  }, []);

  const makeTag = async (tagName: string) => {
    const previousTags = [...tags];

    if (tags.some((tag) => tag.name.toLowerCase() === tagName.toLowerCase())) {
      alert("Tag already exists!");
      return;
    }

    const newId = tags.length > 0 ? tags[tags.length - 1].id! + 1 : 1;

    const tag = {
      id: newId,
      name: tagName,
      users: [],
    };

    setTags((prevTags) => [...prevTags, tag]);

    try {
      setLoading(true);
      setError(null);
      console.log(tagName);

      const response = await createTag(tagName);

      if (!response || !(response >= 200 && response < 300)) {
        throw new Error("Failed to create tag on server");
      }
    } catch (e: any) {
      setError(e.message || "Error adding tag");
      setTags(previousTags);
    } finally {
      setLoading(false);
    }
  };

  const editTag = async (tag: Tag) => {
    const previousTags = [...tags];
    setTags((prevTags) => prevTags.map((t) => (tag.id === t.id ? tag : t)));

    try {
      setLoading(true);
      setError(null);
      const response = await updateTag(tag);
      if (!response || !(response >= 200 && response < 300)) {
        throw new Error("Failed to edit tag on server");
      }
    } catch (e: any) {
      setError(e.message || "Error updating tag");
      setTags(previousTags);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = async (tag: Tag) => {
    const previousTags = [...tags];
    setTags((tags) => tags.filter((t) => t.id !== tag.id));

    try {
      setLoading(true);
      setError(null);
      const response = await deleteTag(tag);
      if (!response || !(response >= 200 && response < 300)) {
        throw new Error("Failed to remove note from server");
      }
    } catch (e: any) {
      setError(e.message || "Error deleting tag");
      setTags(previousTags);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("access_token") != null) {
      fetchTags();
    }
  }, [fetchTags]);

  return (
    <TagContext.Provider
      value={{
        tags,
        error,
        selectedTag,
        isLoading,
        wantToDeleteTag,
        wantToEditTag,
        setError,
        setLoading,
        setTags,
        setSelectedTag,
        setWantToDeleteTag,
        setWantToEditTag,
        makeTag,
        fetchTags,
        removeTag,
        editTag,
      }}
    >
      {children}
    </TagContext.Provider>
  );
};

const useTag = () => {
const context = useContext(TagContext);
if(!context){
  throw new Error("useTag  must be use within a TagProvider");
}
  return context;
};

export default useTag;
export { TagContext, TagProvider };
