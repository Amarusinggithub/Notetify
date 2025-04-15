// In CSRFTokenService.tsx
import axios from "axios";

axios.defaults.withCredentials = true;
let csrfToken: any = null;

export const initializeCSRFToken = async () => {
  let CSRF_URL = process.env.CSRF_URL;
  if (!csrfToken) {
    const response = await axios.get(`${CSRF_URL}`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
    console.log("Fetched CSRF Token:", csrfToken);
  }
};

export const getCSRFToken = () => csrfToken;
