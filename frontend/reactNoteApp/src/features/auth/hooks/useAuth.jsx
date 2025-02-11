import { login, logout, signUp } from "../services/AuthService.jsx";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const setLogin = (userData) => {
    setUserData(userData);
    setIsAuthenticated(true);
    console.log("User data set:", userData);
  };

  const setLogout = () => {
    setUserData(null);
    setIsAuthenticated(false);
    console.log("User logged out");
  };

  const handleSignup = async (email, username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await signUp(email, username, password);
      if (response.status >= 200 && response.status < 300) {
        console.log("Signup successful");
        setLogin(response.data.userData);
        navigate("/");
      } else {
        console.error("Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await login(username, password);
      if (response.status >= 200 && response.status < 300) {
        console.log("Login successful");
        setLogin(response.data.userData);
        navigate("/");
      } else {
        console.error("Login failed");
      }
    } catch (error) {
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
      if (response.status >= 200 && response.status < 300) {
        console.log("Logout successful");
        setLogout();
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("access_token") != null) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
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
