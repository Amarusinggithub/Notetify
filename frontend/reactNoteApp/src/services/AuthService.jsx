import axios from "axios";
import {getCSRFToken} from "./CSRFTokenService.jsx";


axios.defaults.withCredentials = true;
export const login = async (username, password) => {
    try {
        const csrfToken = await getCSRFToken();

        return await axios.post(
            "http://localhost:8000/api/login/",
            {username, password},
            {
                withCredentials: true,
                headers: {"X-CSRFToken": csrfToken,},
            }
        );
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
                headers: {"X-CSRFToken": csrfToken,},
            }
        );
        console.log(response.data);
        return response;
    } catch (error) {
        console.error("Signup error:", error.response ? error.response.data : error.message);
        throw error;
    }
};


export const logout = async () => {
    try {
        const csrfToken = await getCSRFToken();

        return await axios.post("http://localhost:8000/api/logout/", {}, {
            withCredentials: true,
            headers: {"X-CSRFToken": csrfToken,},
        },);

    } catch (e) {
        console.error(e)
    }


}
