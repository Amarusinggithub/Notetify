import { login, logout, signUp } from "../services/AuthService.ts";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

type AuthProviderProps = PropsWithChildren;
interface AuthContextType {
  handleSignup: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<any>>;
  setUserData: React.Dispatch<any>;
  userData: any;
  error: any;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const setLogin = (userData: any) => {
    setUserData(userData);
    console.log("User data set:", userData);
    localStorage.setItem("Userdata", JSON.stringify(userData));
  };

  const setLogout = () => {
    setUserData(null);
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

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      

      const response = await login(email.trim(), password.trim());
      if (response.status >= 200 && response.status < 300) {
        console.log("Login successful");
        navigate("/");
        setLogin(response.data.userData);
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
    const storedUserData = localStorage.getItem("Userdata");

    if (token != null && token != "") {
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        handleSignup,
        handleLogin,
        handleLogout,
        setError,
        setLoading,
        setUserData,
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
