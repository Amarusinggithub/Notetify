import axios from "axios";
import {getCSRFToken} from "./CSRFTokenService.jsx";

export const login = async (username, password) => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.post(
            "http://localhost:8000/api/login/",
            {username, password},
            {
                withCredentials: true,
                headers: {"X-CSRFToken": csrfToken}, // Include headers here
            }
        );
        return response.status;
    } catch (error) {
        console.error("Login error:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const signUp = async (email, username, password) => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.post(
            "http://localhost:8000/api/register/",
            {email, username, password},
            {
                withCredentials: true,
                headers: {"X-CSRFToken": csrfToken}, // Include headers here
            }
        );
        console.log(response.data);
        return response.status;
    } catch (error) {
        console.error("Signup error:", error.response ? error.response.data : error.message);
        throw error;
    }
};


export const logout = async () => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.post("http://localhost:8000/api/logout/", {
            withCredentials: true,
            headers: {"X-CSRFToken": csrfToken},
        },);
        return response.status;

    } catch (e) {
        console.error(e)
    }


}
