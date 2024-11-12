import axios from "axios";


const getCSRFToken = async () => {
    const response = await axios.get("http://localhost:8000/csrf/");
    return response.data.csrfToken;
};

axios.defaults.withCredentials = true;

export const login = async (username, password) => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.post(
            "http://localhost:8000/api/login/",
            {username, password},
            {headers: {"X-CSRFToken": csrfToken}}
        );
        return response.status;
    } catch (error) {
        console.error("Login error:", error.response ? error.response.data : error.message);
        throw error;
    }
};
// Sign up function
export const signUp = async (email, username, password) => {
    try {
        const csrfToken = await getCSRFToken();
        const response = await axios.post(
            "http://localhost:8000/api/register/",
            {email, username, password},
            {headers: {"X-CSRFToken": csrfToken}}
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
        const response = await axios.post("http://localhost:8000/api/logout/", {headers: {"X-CSRFToken": csrfToken}});
        return response.status;

    } catch (e) {
        console.error(e)
    }


}
