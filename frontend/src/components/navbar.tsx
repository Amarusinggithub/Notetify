import { faBars, faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useSearchState from 'hooks/useSearchState.ts';
import React, { useEffect, useState } from 'react';
import useDebounce from '../hooks/useDebounce.ts';
import { useSideNav } from '../hooks/useSideNav.tsx';
import '../styles/navbar.css';
import logo from './../../assets/notetify-logo.png';
import SearchBar from './ui/SearchBar.tsx';

const Navbar = () => {
	const { isSideNavOpen, setIsSideNavOpen, temp } = useSideNav();
	const { setQuery } = useSearchState();
	const [search, setSearch] = useState<string>("");
	const debouncedQuery = useDebounce(search, 300);

	useEffect(() => {
		if (debouncedQuery != undefined && debouncedQuery !== '') {
			setQuery(debouncedQuery);
		}
	}, [debouncedQuery]);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
	};

	const handleSideMenuChange = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setIsSideNavOpen(!isSideNavOpen);
	};

	const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (debouncedQuery != undefined && debouncedQuery !== '') {
			setQuery(debouncedQuery);
		}
	};

	return (
		<div className="navbar">
			<div className="logo-title-container">
				<button
					onClick={(e) => {
						handleSideMenuChange(e);
					}}
					className="menu-btn"
				>
					<FontAwesomeIcon icon={faBars} className="menu-icon" />
				</button>

				<div className="logo-container">
					<img
						src={logo}
						alt="A sample image"
						width="40"
						height="40"
						className={'noteify-logo'}
					></img>
				</div>

				<h1 className="page-header">Notetify</h1>
			</div>

			<SearchBar
				onchange={handleSearchChange}
				onSubmit={handleSearchSubmit}
				search={search}
				placeholder={` Search ${temp.name}`}
				classname={'search-container'}
			/>

			<div className="icons-container">
				<button>
					<FontAwesomeIcon icon={faGear} className="icon" />
				</button>
			</div>
		</div>
	);
};

export default Navbar;
