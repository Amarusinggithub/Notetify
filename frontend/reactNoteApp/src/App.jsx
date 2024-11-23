import './App.css';

import {useEffect, useState} from "react";
import UserContext from "./context/UserContext";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ErrorPage from "./components/error-page.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import SignUpForm from "./components/auth/SignUpForm.jsx";
import {initializeCSRFToken} from "./services/CSRFTokenService.jsx";


export default function App() {

  useEffect(() => {
    const initialize = async () => {
      await initializeCSRFToken();
    };
    initialize();
  }, []);


  const [userData, setUser] = useState(null);

  const setLogin = (userData) => {
    setUser(userData);
    console.log("this is the user data:", userData)
  };

  const setLogout = () => {
    setUser(null);
    console.log("this is the user data:", userData)
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage/>,
      errorElement: <ErrorPage/>,
    },
    {
      path: "login",
      element: <LoginForm/>,
    },
    {
      path: "signup",
      element: <SignUpForm/>,
    },
  ]);

  return (
      <UserContext.Provider value={{userData, setLogin, setLogout}}>
          <RouterProvider router={router}/>
      </UserContext.Provider>
  );
}
