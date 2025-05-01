import { Tag } from "types/index.ts";
import axiosInstance from "./AxiosService.ts";

export const getTags = async () => {
  try {
    const response = await axiosInstance.get("api/tags/");
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const createTag = async (tagName: string) => {
  try {
    const response = await axiosInstance.post("api/tags/create_tag/", {
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
    const response = await axiosInstance.put(`api/tags/edit_tag/${tag.id}/`, {
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
    const response = await axiosInstance.delete(
      `api/tags/delete_tag/${tag.id}/`
    );
    console.log(response.status);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};
