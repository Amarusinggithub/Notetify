import {
	faArchive,
	faLightbulb,
	faStar,
	faTrash,
} from '@fortawesome/free-solid-svg-icons';
import React, {
	createContext,
	type PropsWithChildren,
	useContext,
	useState,
} from 'react';
import { type SideMenuItem } from '../types';

type SideNavContextType = {
	sidebarMenuItems: SideMenuItem[];
	isSideNavOpen: boolean;
	page: number;
	isAddTagPopupOpen: boolean;
	temp: any;
	setTemp: React.Dispatch<React.SetStateAction<any>>;
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
			name: 'Notes',
			icon: faLightbulb,
			href: '/',
			isActive: true,
			params: 'is_trashed=False&is_archived=False',
		},
		{
			name: 'Favorites',
			icon: faStar,
			href: '/favorite',
			isActive: false,
			params: 'is_favorite=True&is_trashed=False&is_archived=False',
		},
		{
			name: 'Archive',
			icon: faArchive,
			href: '/archive',
			isActive: false,
			params: 'is_archived=True&is_trashed=False',
		},
		{
			name: 'Trash',
			icon: faTrash,
			href: '/trash',
			isActive: false,
			params: 'is_trashed=True',
		},
	]);

	const [temp, setTemp] = useState<any>(sidebarMenuItems[0]);

	return (
		<SideNavContext.Provider
			value={{
				temp,
				sidebarMenuItems,
				isSideNavOpen,
				page,
				isAddTagPopupOpen,
				setIsSideNavOpen,
				setPage,
				setAddTagPopupOpen,
				setSidebarMenuItems,
				setTemp,
			}}
		>
			{children}
		</SideNavContext.Provider>
	);
};
