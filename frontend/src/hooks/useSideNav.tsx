import { createContext, PropsWithChildren, useContext, useState } from 'react';

type SideNavContextType = {
	isSideNavOpen: boolean;
	page: number;
	isAddTagPopupOpen: boolean;
	setIsSideNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	setAddTagPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type SideNavProviderProps = PropsWithChildren;

export const SideNavContext = createContext<SideNavContextType | undefined>(undefined);

export const useSideNav = () => {
	const context = useContext(SideNavContext);
	if (!context) {
		throw new Error(' useSideNav must be used within a SideNavProvider');
	}

	return context;
};

export const SideNavProvider = ({ children }: SideNavProviderProps) => {
	const [isSideNavOpen, setIsSideNavOpen] = useState<boolean>(true);
	const [page, setPage] = useState<number>(0);
	const [isAddTagPopupOpen, setAddTagPopupOpen] = useState<boolean>(false);

	return (
		<SideNavContext.Provider
			value={{
				isSideNavOpen,
				page,
				isAddTagPopupOpen,
				setIsSideNavOpen,
				setPage,
				setAddTagPopupOpen,
			}}
		>
			{children}
		</SideNavContext.Provider>
	);
};
