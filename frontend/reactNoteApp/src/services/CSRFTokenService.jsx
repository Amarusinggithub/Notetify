// In CSRFTokenService.js
import axios from "axios";

axios.defaults.withCredentials = true;
let csrfToken = null;

export const initializeCSRFToken = async () => {
    if (!csrfToken) {
        const response = await axios.get("http://localhost:8000/csrf/", {
            withCredentials: true,
        });
        csrfToken = response.data.csrfToken;
        console.log("Fetched CSRF Token:", csrfToken);
    }
};

export const getCSRFToken = () => csrfToken;
