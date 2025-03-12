import React ,{createContext, useState} from "react";

export const SideNavContext = createContext();

export const SideNavProvider = ({children}) => {
    const [isSideNavOpen, setIsSideNavOpen] = useState(true);
    const [page, setPage] = useState(0);
    const [isAddTagPopupOpen, setAddTagPopupOpen] = useState(false);


    return (
      <SideNavContext.Provider
        value={{
          isSideNavOpen,
          setIsSideNavOpen,
          page,
          setPage,
          isAddTagPopupOpen,
          setAddTagPopupOpen,
        }}
      >
        {children}
      </SideNavContext.Provider>
    );
};
