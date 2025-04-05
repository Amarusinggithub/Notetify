import { useSideNav } from "../hooks/useSideNav.js";
import NotesPage from "../pages/NotesPage.js";
import FavoritesPage from "../pages/FavoritesPage.js";
import ArchivePage from "../pages/ArchivePage.js";
import TrashPage from "../pages/TrashPage.js";
import SearchPage from "../pages/SearchPage.js";

import useNote from "../hooks/useNote.js";
import TagPage from "../pages/TagPage.js";

export const Pages = () => {
  const { search } = useNote();
  const { page } = useSideNav();

  const SidebarPages = [
    <NotesPage key="notes" />,
    <FavoritesPage key="favorites" />,
    <ArchivePage key="archive" />,
    <TrashPage key="trash" />,
    <SearchPage key="search" />,
    <TagPage key="tag" />,
  ];

  if (search.length > 0) {
    return SidebarPages[4];
  }

  return SidebarPages[page];
};
