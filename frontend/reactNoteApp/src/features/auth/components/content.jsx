import {useContext} from "react";
import {SideNavContext} from "../../../context/SideNavContext.jsx";
import NotesPage from "../../notes/pages/NotesPage.jsx";
import FavoritesPage from "../../notes/pages/FavoritesPage.jsx";
import ArchivePage from "../../notes/pages/ArchivePage.jsx";
import TrashPage from "../../notes/pages/TrashPage.jsx";
import useNote from "../../notes/hooks/useNote.jsx";
import SearchPage from "../../notes/pages/SearchPage.jsx";

export const Content = () => {
        const { search  } = useNote();

    const SidebarPages = [<NotesPage/>, <FavoritesPage/>, <ArchivePage/>, <TrashPage/>, <SearchPage/>];

    const {page} = useContext(SideNavContext);

    if(search.length > 0){
        return SidebarPages[4];
    }

    return SidebarPages[page];
};
