// Make sure this path is correct
import useNote from "../../notes/hooks/useNote.tsx"; // Adjust this path
import { login, logout, signUp } from "../services/AuthService.ts";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTag from "../../notes/hooks/useTag.tsx";

const AuthContext = createContext<any>({});

const AuthProvider = ({ children }: { children: any }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { fetchNotes } = useNote();
  const { fetchTags } = useTag();

  const setLogin = (userData: any) => {
    setUserData(userData);
    setIsAuthenticated(true);
    console.log("User data set:", userData);
    localStorage.setItem("Userdata", JSON.stringify(userData));
  };

  const setLogout = () => {
    setUserData(null);
    setIsAuthenticated(false);
    console.log("User logged out");
    localStorage.removeItem("Userdata");
  };

  const handleSignup = async (
    email: string,
    username: string,
    password: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await signUp(email, username, password);
      if (response.status >= 200 && response.status < 300) {
        console.log("Signup successful");
        setLogin(response.data.userData);
        navigate("/");
        await fetchNotes();
        await fetchTags();
      } else {
        console.error("Signup failed");
      }
    } catch (error: any) {
      console.error("Error during signup:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await login(username, password);
      if (response.status >= 200 && response.status < 300) {
        console.log("Login successful");
        navigate("/");
        setLogin(response.data.userData);
        await fetchNotes();
        await fetchTags();
      } else {
        console.error("Login failed");
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await logout();
      if (!response || !(response.status >= 200 && response.status < 300)) {
        console.log("Logout successful");
        setLogout();
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error: any) {
      console.error("Error during logout:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(Boolean(token));
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        handleSignup,
        handleLogin,
        handleLogout,
        isAuthenticated,
        userData,
        error,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
