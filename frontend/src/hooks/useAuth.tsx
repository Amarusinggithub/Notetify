import { login, logout, signUp, verifyAuth } from "../lib/AuthService.ts";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  userData: any;
  error: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState(null);

  const setAuth = (userData: any) => {
    setIsAuthenticated(true);
    setUserData(userData);
    console.log("User data set:", userData);
    localStorage.setItem("Userdata", JSON.stringify(userData));
  };

  const setLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    console.log("User logged out");
    localStorage.removeItem("userData");
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
        await setAuth(response.data.userData);
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
        await setAuth(response.data.userData);
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
      await logout();
    } catch (error: any) {
      console.error("Error during logout:", error);
      setError(error);
    } finally {
      setLogout();
      setLoading(false);
    }
  };

  const confirmAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await verifyAuth();
      if (response.status >= 200 && response.status < 300) {
        setAuth(response.data);
      }
    } catch (e: any) {
      setLogout();
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let cached = localStorage.getItem("userData");

    if (cached) setAuth(JSON.parse(cached));
    confirmAuth();
  }, [confirmAuth]);

  return (
    <AuthContext.Provider
      value={{
        handleSignup,
        handleLogin,
        handleLogout,
        setError,
        setIsAuthenticated,
        setLoading,
        setUserData,
        userData,
        error,
        isLoading,
        isAuthenticated,
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
