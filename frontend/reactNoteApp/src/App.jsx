import './App.css';

import {useEffect, useState} from "react";
import UserContext from "./context/UserContext";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ErrorPage from "./pages/error-page.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
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
        element: <LoginPage/>,
    },
    {
      path: "signup",
        element: <SignUpPage/>,
    },
  ]);

  return (
      <UserContext.Provider value={{userData, setLogin, setLogout}}>
          <RouterProvider router={router}/>
      </UserContext.Provider>
  );
}
