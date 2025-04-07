import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import ArchivePage from "../pages/ArchivePage";
import FavoritesPage from "../pages/FavoritesPage";
import NotesPage from "../pages/NotesPage";
import TagPage from "../pages/TagPage";
import TrashPage from "../pages/TrashPage";
import ErrorPage from "../pages/ErrorPage";
import App from "../pages/MainPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const AppRoutes = () => {
  const routes =
    localStorage.getItem("access_token") != null &&
    localStorage.getItem("access_token") != ""
      ? privateRoutes
      : publicRoutes;
  let router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default AppRoutes;
const publicRoutes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
    errorElement: <ErrorPage />,
  },
];

const privateRoutes = [
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: "/Notes",
        element: <NotesPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/Favorites",
        element: <FavoritesPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/Archives",
        element: <ArchivePage />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/Tags",
        element: <TagPage />,
        errorElement: <ErrorPage />,

        Children: [
          {
            path: "/Tags/:tagid",
            element: <TagPage />,
            errorElement: <ErrorPage />,
          },
        ],
      },
      {
        path: "/Trash",
        element: <TrashPage />,
        errorElement: <ErrorPage />,
      },
    ],
  },
];
