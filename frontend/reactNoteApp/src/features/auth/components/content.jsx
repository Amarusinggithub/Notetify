import {useContext} from "react";
import {SideNavContext} from "../../../context/SideNavContext.jsx";
import NotesPage from "../../notes/pages/NotesPage.jsx";
import FavoritesPage from "../../notes/pages/FavoritesPage.jsx";
import ArchivePage from "../../notes/pages/ArchivePage.jsx";
import TrashPage from "../../notes/pages/TrashPage.jsx";

export const Content = () => {
    const SidebarPages = [<NotesPage/>, <FavoritesPage/>, <ArchivePage/>, <TrashPage/>];

    const {page} = useContext(SideNavContext);

    return SidebarPages[page];
};
