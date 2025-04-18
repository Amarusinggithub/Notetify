// In CSRFTokenService.tsx
import axios from "axios";

axios.defaults.withCredentials = true;
let csrfToken: any = null;

export const initializeCSRFToken = async () => {
  const VITE_CSRF_URL = import.meta.env.VITE_CSRF_URL as string;

  if (!csrfToken) {
    const response = await axios.get(`${VITE_CSRF_URL}`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrftoken;
  }
};

export const getCSRFToken = () => csrfToken;
