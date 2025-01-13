import {createContext, useState} from "react";

export const SideNavContext = createContext();

export const SideNavProvider = ({children}) => {
    const [isSideNavOpen, setIsSideNavOpen] = useState(true);
    const [page, setPage] = useState(0);

    return (
        <SideNavContext.Provider value={{isSideNavOpen, setIsSideNavOpen, page, setPage}}>
            {children}
        </SideNavContext.Provider>
    );
};
