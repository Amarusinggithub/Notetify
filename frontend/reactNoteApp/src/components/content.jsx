import { useContext } from "react";
import { SideNavContext } from "../context/SideNavContext.jsx";
import NotesPage from "../features/notes/pages/NotesPage.jsx";
import FavoritesPage from "../features/notes/pages/FavoritesPage.jsx";
import ArchivePage from "../features/notes/pages/ArchivePage.jsx";
import TrashPage from "../features/notes/pages/TrashPage.jsx";
import SearchPage from "../features/notes/pages/SearchPage.jsx";

import useNote from "../features/notes/hooks/useNote.jsx";
import TagPage from "../features/notes/pages/TagPage.jsx";

export const Content = () => {
  const { search } = useNote();

  const SidebarPages = [
    <NotesPage key="notes" />,
    <FavoritesPage key="favorites" />,
    <ArchivePage key="archive" />,
    <TrashPage key="trash" />,
    <SearchPage key="search" />,
    <TagPage key="tag"/>
  ];

  const { page } = useContext(SideNavContext);

  if (search.length > 0) {
    return SidebarPages[4];
  }

  return SidebarPages[page];
};
