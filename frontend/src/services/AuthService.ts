import useAxios from "../hooks/useAxios.tsx";

  let axiosInstance = useAxios();


export const login = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post("login/", {
      "email": email,
      "password": password,
    });
    const { access_token, refresh_token } = response.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
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
    const response = await axiosInstance.post("register/", {
      "email": email,
      "username": username,
      "password":password,
    });
    const { access_token, refresh_token } = response.data;
    // Store tokens consistently.
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
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
    const response = await axiosInstance.post("logout/");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    console.log("Logout successful. Tokens removed.");
    return response;
  } catch (error: any) {
    console.error(
      "Logout error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

