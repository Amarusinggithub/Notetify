import {
	faBars,
	faGear,
	faList,
	faMagnifyingGlass,
	faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import useNote from '../hooks/useNote.tsx';
import { useSideNav } from '../hooks/useSideNav.tsx';
import '../styles/navbar.css';

import useDebounce from '../hooks/useDebounce.ts';
import logo from './../../assets/notetify-logo.png';

const Navbar = () => {
	const { isSideNavOpen, setIsSideNavOpen } = useSideNav();
	const { handleSearch, title, refetch, search, setSearch } = useNote();
	const debouncedQuery = useDebounce(search, 150);

	useEffect(() => {
		if (debouncedQuery != undefined && debouncedQuery !== '') {
			handleSearch(debouncedQuery);
		}
	}, [handleSearch, debouncedQuery]);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
	};

	const handleSideMenuChange = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setIsSideNavOpen(!isSideNavOpen);
	};

	const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		handleSearch(debouncedQuery);
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
				{(title.length <= 0 || title === 'Notes') && (
					<div className="logo-container">
						<img
							src={logo}
							alt="A sample image"
							width="40"
							height="40"
							className={'noteify-logo'}
						></img>
					</div>
				)}

				{(title.length <= 0 || title === 'Notes') && <h1 className="title-header">Notetify</h1>}
				{title.length > 0 && title !== 'Notes' && <h1 className="title-header">{title}</h1>}
			</div>

			<form
				onSubmit={(e) => {
					handleSearchSubmit(e);
				}}
				className="search-container"
			>
				<button type="submit">
					<FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
				</button>
				<input
					name="search"
					placeholder="Search"
					value={search}
					onChange={(e) => {
						handleSearchChange(e);
					}}
					type="text"
				/>
			</form>

			<div className="icons-container">
				<button
					onClick={() => {
						refetch();
					}}
				>
					<FontAwesomeIcon icon={faRotateRight} className="icon" />
				</button>
				<button>
					<FontAwesomeIcon icon={faList} className="icon" />
				</button>
				<button>
					<FontAwesomeIcon icon={faGear} className="icon" />
				</button>
			</div>
		</div>
	);
};

export default Navbar;
