import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'

import SignUpForm from "./components/auth/SignUpForm.jsx";

import {createBrowserRouter, RouterProvider,} from "react-router-dom";
import ErrorPage from "./components/error-page.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import HomePage from "./pages/HomePage.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "LoginForm/",
        element: <LoginForm/>,
    }, {
        path: "SignUpForm/",
        element: <SignUpForm/>,
    },
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>,
)
