import { useSideNav } from '../hooks/useSideNav.js';
import Archive from '../pages/Archive.js';
import Favorite from '../pages/Favorites.js';
import Home from '../pages/Home.js';
import Search from '../pages/Search.js';
import Trash from '../pages/Trash.js';

import useNote from '../hooks/useNote.js';
import Tag from '../pages/Tag.js';

export const Pages = () => {
	const { search } = useNote();
	const { page } = useSideNav();

	const SidebarPages = [
		<Home key="notes" />,
		<Favorite key="favorites" />,
		<Archive key="archive" />,
		<Trash key="trash" />,
		<Search key="search" />,
		<Tag key="tag" />,
	];

	if (search.length > 0) {
		return SidebarPages[4];
	}

	return SidebarPages[page];
};
