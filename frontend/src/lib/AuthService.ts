import { getCookie } from "../utils/cookies.ts";
import axiosInstance from "./AxiosService.ts";

export const login = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post("api/login/", {
      email: email,
      password: password,
    });
    let access_token = getCookie("access_token");
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${access_token}`;
    console.log("Login successful. Tokens stored.");
    return response;
  } catch (error: any) {
    console.error(
      "Login error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const signUp = async (
  email: string,
  username: string,
  password: string
) => {
  try {
    const response = await axiosInstance.post("api/register/", {
      email: email,
      username: username,
      password: password,
    });
    let access_token = getCookie("access_token");
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${access_token}`;
    console.log("Signup successful. Tokens stored.");
    return response;
  } catch (error: any) {
    console.error(
      "Signup error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post("api/logout/");
    return response;
  } catch (error: any) {
    console.error(
      "Logout error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};


export const verifyAuth= async () => {
  try {
    const response = await axiosInstance.get("auth/me/");
    return response;
  } catch (error: any) {
    console.error(
      "error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};


