import  { useContext } from "react";
import { SideNavContext } from "../context/SideNavContext.js";
import NotesPage from "../features/notes/pages/NotesPage.js";
import FavoritesPage from "../features/notes/pages/FavoritesPage.js";
import ArchivePage from "../features/notes/pages/ArchivePage.js";
import TrashPage from "../features/notes/pages/TrashPage.js";
import SearchPage from "../features/notes/pages/SearchPage.js";

import useNote from "../features/notes/hooks/useNote.js";
import TagPage from "../features/notes/pages/TagPage.js";

export const Content = () => {
  const { search } = useNote();
  const { page } = useContext(SideNavContext);


  const SidebarPages = [
    <NotesPage key="notes" />,
    <FavoritesPage key="favorites" />,
    <ArchivePage key="archive" />,
    <TrashPage key="trash" />,
    <SearchPage key="search" />,
    <TagPage key="tag"/>
  ];


  if (search.length > 0) {
    return SidebarPages[4];
  }

  return SidebarPages[page];
};
