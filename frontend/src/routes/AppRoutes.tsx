import Login from "../pages/Login.tsx";
import Register from "../pages/Register.tsx";
import Archive from "../pages/Archive.tsx";
import Favorite from "../pages/Favorites.tsx";
import Home from "../pages/Home.tsx";
import Tag from "../pages/Tag.tsx";
import Trash from "../pages/Trash.tsx";
import MainLayout from "../pages/layout.tsx";
import { createBrowserRouter, RouterProvider,Navigate } from "react-router";
import Landing from "../pages/Landing.tsx";
import { useAuth } from "./../hooks/useAuth.tsx";
import Search from "../pages/Search.tsx";
import { useMemo } from "react";

const AppRoutes = () => {
  const { isAuthenticated, checkingAuth } = useAuth();
  if (checkingAuth) return null; 

  const routes = isAuthenticated ? privateRoutes : publicRoutes;

  let router = useMemo(() => {
    return createBrowserRouter(routes);
  }, [routes]);

  return (
    <RouterProvider
      router={router}
      key={isAuthenticated ? "authenticated" : "notAuthenticated"}
    />
  );
};

export default AppRoutes;

const publicRoutes = [
  {
    path: "/",
    Component: Landing,
  },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  { path: "*", Component: () => <Navigate to="/" replace /> },
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
            path: ":noteid",
          },
        ],
      },
      {
        path: "archive",
        Component: Archive,
        children: [
          {
            path: ":noteid",
          },
        ],
      },
      {
        path: "tag",
        Component: Tag,
        children: [
          {
            path: ":noteid",
          },
        ],
      },
      {
        path: "trash",
        Component: Trash,
        children: [
          {
            path: ":noteid",
          },
        ],
      },
      {
        path: "search",
        Component: Search,
        children: [
          {
            path: ":noteid",
          },
        ],
      },
      { path: "*", Component: () => <Navigate to="/" replace /> },
    ],
  },
];
