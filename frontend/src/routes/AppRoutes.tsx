import { useAuth } from "features/auth/hooks/useAuth";
import LoginPage from "features/auth/pages/LoginPage";
import SignUpPage from "features/auth/pages/SignUpPage";
import ArchivePage from "features/notes/pages/ArchivePage";
import FavoritesPage from "features/notes/pages/FavoritesPage";
import NotesPage from "features/notes/pages/NotesPage";
import TagPage from "features/notes/pages/TagPage";
import TrashPage from "features/notes/pages/TrashPage";
import ErrorPage from "pages/ErrorPage";
import App from "pages/MainPage";
import { createBrowserRouter,  RouterProvider } from "react-router-dom";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const routes = isAuthenticated ? privateRoutes : publicRoutes;
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
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
];

const privateRoutes = [
  {
    path: "/login",
    element: <LoginPage />,
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
      },
      {
        path: "/Favorites",
        element: <FavoritesPage />,
      },
      {
        path: "/Archives",
        element: <ArchivePage />,
      },
      {
        path: "/Tags",
        element: <TagPage />,
        Children: [
          {
            path: "/Tags/:tagid",
            element: <FavoritesPage />,
          },
        ],
      },
      {
        path: "/Trash",
        element: <TrashPage />,
      },
    ],
  },
];
