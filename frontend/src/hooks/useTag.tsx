import { createContext, PropsWithChildren, useContext, useState } from "react";

import { createTag, deleteTag, getTags, updateTag } from "../lib/TagService.ts";
import { Tag } from "types/index.ts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth.tsx";

interface TagContextType {
  selectedTag: Tag | null;
  isLoading: boolean;
  isError: any;
  data: Tag[];
  wantToDeleteTag: boolean;
  wantToEditTag: boolean;
  setSelectedTag: React.Dispatch<React.SetStateAction<Tag | null>>;
  setWantToDeleteTag: React.Dispatch<React.SetStateAction<boolean>>;
  setWantToEditTag: React.Dispatch<React.SetStateAction<boolean>>;
  makeTag: (tagName: string) => Promise<void>;
  editTag: (tag: Tag) => Promise<void>;
  removeTag: (tag: Tag) => Promise<void>;
}

type TagProviderProps = PropsWithChildren;

const TagContext = createContext<TagContextType | undefined>(undefined);

const TagProvider = ({ children }: TagProviderProps) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
    enabled: isAuthenticated,
  });

  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [wantToDeleteTag, setWantToDeleteTag] = useState<boolean>(false);
  const [wantToEditTag, setWantToEditTag] = useState<boolean>(false);

  const createTagMutation = useMutation({
    mutationFn: createTag,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const makeTag = async (tagName: string) => {
    if (tagName!.trim().length > 0)
      if (
        data.some(
          (tag: Tag) => tag.name.toLowerCase() === tagName.toLowerCase()
        )
      ) {
        alert("Tag already exists!");
        return;
      }

    createTagMutation.mutate(tagName);
  };

  const editTagMutation = useMutation({
    mutationFn: updateTag,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const editTag = async (tag: Tag) => {
    if (tag.name!.trim().length > 0) editTagMutation.mutate(tag);
  };

  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const removeTag = async (tag: Tag) => {
    deleteTagMutation.mutate(tag);
  };

  return (
    <TagContext.Provider
      value={{
        isError,
        selectedTag,
        isLoading,
        wantToDeleteTag,
        wantToEditTag,
        data,
        setSelectedTag,
        setWantToDeleteTag,
        setWantToEditTag,
        makeTag,
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
  if (!context) {
    throw new Error("useTag  must be use within a TagProvider");
  }
  return context;
};

export default useTag;
export { TagContext, TagProvider };
