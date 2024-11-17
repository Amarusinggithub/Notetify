import axios from "axios";

export const getCSRFToken = async () => {
    const response = await axios.get("http://localhost:8000/csrf/");
    return response.data.csrfToken;
};
