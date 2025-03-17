// In CSRFTokenService.tsx
import axios from "axios";

axios.defaults.withCredentials = true;
let csrfToken: any = null;

export const initializeCSRFToken = async () => {
  if (!csrfToken) {
    const response = await axios.get("http://127.0.0.1:8000/csrf/", {
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
    console.log("Fetched CSRF Token:", csrfToken);
  }
};

export const getCSRFToken = () => csrfToken;
