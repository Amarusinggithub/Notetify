import Login from "../pages/Login.tsx";
import Register from "../pages/Register.tsx";
import Archive from "../pages/Archive.tsx";
import Favorite from "../pages/Favorites.tsx";
import Home from "../pages/Home.tsx";
import Tag from "../pages/Tag.tsx";
import Trash from "../pages/Trash.tsx";
import MainLayout from "../pages/layout.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Landing from "../pages/Landing.tsx";
import { useAuth } from "./../hooks/useAuth.tsx";
import Search from "../pages/Search.tsx";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const routes = isAuthenticated ? publicRoutes : privateRoutes;
  let router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default AppRoutes;

const publicRoutes = [
  {
    path: "/",
    Component: Landing,
  },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
];

const privateRoutes = [
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: ":noteid",
        Component: Home,
      },
      {
        path: "favorite",
        Component: Favorite,
        children: [
          {
            path: "/favorite/:noteid",
          },
        ],
      },
      {
        path: "archive",
        Component: Archive,
        children: [
          {
            path: "/archive/:noteid",
          },
        ],
      },
      {
        path: "tag",
        Component: Tag,
        children: [
          {
            path: "/tag/:tagid",
          },
        ],
      },
      {
        path: "trash",
        Component: Trash,
        children: [
          {
            path: "/trash/:noteid",
          },
        ],
      },
      {
        path: "search",
        Component: Search,
        children: [
          {
            path: "/search/:noteid",
          },
        ],
      },
    ],
  },
];
