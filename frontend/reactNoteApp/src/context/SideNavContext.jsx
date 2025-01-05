import {createContext, useState} from "react";

export const SideNavContext = createContext();

export const SideNavProvider = ({children}) => {
    const [isSideNavOpen, setIsSideNavOpen] = useState(true);

    return (
        <SideNavContext.Provider value={{isSideNavOpen, setIsSideNavOpen}}>
            {children}
        </SideNavContext.Provider>
    );
};
