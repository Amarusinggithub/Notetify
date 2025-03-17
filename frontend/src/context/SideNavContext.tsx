import{createContext, useState} from "react";

export const SideNavContext = createContext<any>({});

export const SideNavProvider = ({children}:{children:any}) => {
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
