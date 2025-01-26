import {
  createContext,
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
} from "../services/TagService.jsx";

const TagContext = createContext();

const TagProvider = ({ children }) => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTags = await getTags();
      setTags(fetchedTags);
    } catch (e) {
      setError(e.message || "Error fetching tags");
    } finally {
      setLoading(false);
    }
  }, []);

  const makeTag = async (tag) => {
    const previousTags = [...tags];
    setTags([...tags, tag]);

    try {
      setLoading(true);
      setError(null);

      const response = await createTag(tag);

      if (!(response >= 200 && response < 300)) {
        throw new Error("Failed to create tag on server");
      }
    } catch (e) {
      setError(e.message || "Error adding tag");
      setTags(previousTags);
    } finally {
      setLoading(false);
    }
  };

  const editTag = async (tag) => {
    const previousTags = [...tags];
    setTags((prevTags) => prevTags.map((t) => (tag.id === t.id ? tag : t)));

    try {
      setLoading(true);
      setError(null);
      const response = await updateTag(tag);
      if (!(response >= 200 && response < 300)) {
        throw new Error("Failed to edit tag on server");
      }
    } catch (e) {
      setError(e.message || "Error updating tag");
      setTags(previousTags);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = async (tag) => {
    const previousTags = [...tags];
    setTags((tags) => tags.filter((t) => t.id !== tag.id));

    try {
      setLoading(true);
      setError(null);
      const response = await deleteTag(tag);
      if (!(response >= 200 && response < 300)) {
        throw new Error("Failed to remove note from server");
      }
    } catch (e) {
      setError(e.message || "Error deleting tag");
      setTags(previousTags);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <TagContext.Provider
      value={{ tags, error, isLoading, makeTag, fetchTags, removeTag, editTag }}
    >
      {children}
    </TagContext.Provider>
  );
};

const useTag = () => {
  return useContext(TagContext);
};

export default useTag;
export { TagContext, TagProvider };
