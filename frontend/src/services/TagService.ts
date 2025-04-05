import { Tag } from "types/types.ts";
import useAxios from "../hooks/useAxios.tsx";


let axiosInstance = useAxios();

export const getTags = async () => {
  try {
    const response = await axiosInstance.get("tags/");
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const createTag = async (tagName: string) => {
  try {
    const response = await axiosInstance.post("tags/create_tag/", {
      name: tagName,
    });
    console.log(response.data);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};

export const updateTag = async (tag: Tag) => {
  try {
    const response = await axiosInstance.put(`tags/edit_tag/${tag.id}/`, {
      id: tag.id,
      name: tag.name,
      users: tag.users,
    });

    console.log(response.data);
    return response.status;
  } catch (error) {
    console.error(error);
  }
};

export const deleteTag = async (tag: Tag) => {
  try {
    const response = await axiosInstance.delete(`tags/delete_tag/${tag.id}/`);
    console.log(response.status);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};
