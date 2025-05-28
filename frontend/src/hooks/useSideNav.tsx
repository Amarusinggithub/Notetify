import {
	faArchive,
	faLightbulb,
	faStar,
	faTrash,
} from '@fortawesome/free-solid-svg-icons';
import React, {
	createContext,
	PropsWithChildren,
	useContext,
	useState,
} from 'react';
import { SideMenuItem } from 'types';

type SideNavContextType = {
	sidebarMenuItems: SideMenuItem[];
	isSideNavOpen: boolean;
	page: number;
	isAddTagPopupOpen: boolean;
	setIsSideNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	setAddTagPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSidebarMenuItems: React.Dispatch<React.SetStateAction<SideMenuItem[]>>;
};

type SideNavProviderProps = PropsWithChildren;

export const SideNavContext = createContext<SideNavContextType | undefined>(
	undefined,
);

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
	const [sidebarMenuItems, setSidebarMenuItems] = useState<SideMenuItem[]>([
		{
			title: 'Notes',
			icon: faLightbulb,
			href: '/',
			isActive: true,
		},
		{
			title: 'Favorites',
			icon: faStar,
			href: '/favorite',
			isActive: false,
		},
		{
			title: 'Archive',
			icon: faArchive,
			href: '/archive',
			isActive: false,
		},
		{
			title: 'Trash',
			icon: faTrash,
			href: '/trash',
			isActive: false,
		},
	]);

	return (
		<SideNavContext.Provider
			value={{
				sidebarMenuItems,
				isSideNavOpen,
				page,
				isAddTagPopupOpen,
				setIsSideNavOpen,
				setPage,
				setAddTagPopupOpen,
				setSidebarMenuItems,
			}}
		>
			{children}
		</SideNavContext.Provider>
	);
};
