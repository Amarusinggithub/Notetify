import { faEllipsis, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Tag } from 'types/index.ts';
import useNote from '../hooks/useNote.tsx';
import { useSideNav } from '../hooks/useSideNav.tsx';
import useTag from '../hooks/useTag.tsx';
import '../styles/sidebar.css';

const SideNav = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isSideNavOpen, setAddTagPopupOpen, sidebarMenuItems } = useSideNav();
	const { handleTagClick, setPage } = useNote();
	const { data, setWantToDeleteTag, setSelectedTag, setWantToEditTag } = useTag();

	const [temp, setTemp] = useState<any>(sidebarMenuItems[0]);
	const [tempId, setTempId] = useState<any>(null);

	let path = location.pathname;
	useEffect(() => {
		for (let i = 0; i < sidebarMenuItems.length; i++) {
			if (path === sidebarMenuItems[i].href) {
				setTemp(sidebarMenuItems[i]);
				setPage(sidebarMenuItems[i].title);
				navigate(sidebarMenuItems[i].href);
			}
		}

		for (let j = 0; j < data.length; j++) {
			if (path === '/tag/' + data[j].id) {
				setTemp(data[j].id);
				setPage(data[j].name);
				handleTagClick(data[j]);
			}
		}
	}, [data]);

	const handleOnClick = (index: number) => {
		return () => {
			setTemp(sidebarMenuItems[index]);
			setPage(sidebarMenuItems[index].title);
			navigate(sidebarMenuItems[index].href);
		};
	};

	const handleTagClicked = (tag: Tag) => {
		setTemp(tag.id);
		setPage(tag.name);
		handleTagClick(tag);
		navigate('/tag/' + tag.name);
	};

	const handleCreateTag = () => {
		setTemp(true);
		setAddTagPopupOpen(true);
	};

	return (
		<div
			className="sidenav"
			style={{
				width: isSideNavOpen ? '250px' : '50px',
			}}
		>
			<ul>
				{sidebarMenuItems.map((item, index) => (
					<li
						onClick={handleOnClick(index)}
						key={index}
						style={{
							width: isSideNavOpen ? '210px' : '14px',
							borderTopRightRadius: isSideNavOpen ? '50px' : '360px',
							borderTopLeftRadius: isSideNavOpen ? '0px' : '360px',
							borderBottomLeftRadius: isSideNavOpen ? '0px' : '360px',
							borderBottomRightRadius: isSideNavOpen ? '50px' : '360px',
							justifyContent: isSideNavOpen ? 'start' : 'start',
							backgroundColor: sidebarMenuItems[index] === temp ? ' rgb(65, 51, 28)' : '',
						}}
						className="sidenav-item"
					>
						<div className="icon-and-name">
							<FontAwesomeIcon icon={item.icon!} className="icon" />
							{isSideNavOpen && <h3>{item.title}</h3>}
						</div>
					</li>
				))}
			</ul>

			<ul>
				<li
					onClick={handleCreateTag}
					style={{
						width: isSideNavOpen ? '210px' : '14px',
						borderTopRightRadius: isSideNavOpen ? '50px' : '360px',
						borderTopLeftRadius: isSideNavOpen ? '0px' : '360px',
						borderBottomLeftRadius: isSideNavOpen ? '0px' : '360px',
						borderBottomRightRadius: isSideNavOpen ? '50px' : '360px',
						justifyContent: isSideNavOpen ? 'start' : 'center',
						backgroundColor: temp === true ? ' rgb(65, 51, 28)' : '',
					}}
					className="sidenav-item-add-tag"
				>
					<div className="icon-and-name">
						<FontAwesomeIcon icon={faPlus} className="icon" />
						{isSideNavOpen && <h3>{'Add Tag'}</h3>}
					</div>
				</li>
				{isSideNavOpen && data?.length > 0 && <h3 className="title-tags">Tags</h3>}
				{data?.length > 0 && (
					<ul className="tags">
						{data.map((tag: Tag, index: number) => (
							<li
								onClick={(e) => {
									e.stopPropagation();
									handleTagClicked(tag);
								}}
								key={index}
								className="sidenav-item-tags"
								style={{
									width: isSideNavOpen ? '210px' : '14px',
									borderTopRightRadius: isSideNavOpen ? '50px' : '360px',
									borderTopLeftRadius: isSideNavOpen ? '0px' : '360px',
									borderBottomLeftRadius: isSideNavOpen ? '0px' : '360px',
									borderBottomRightRadius: isSideNavOpen ? '50px' : '360px',
									justifyContent: isSideNavOpen ? 'start' : 'center',
									backgroundColor: tag.id === temp ? ' rgb(65, 51, 28)' : '',
								}}
							>
								<div className="icon-and-name">
									<FontAwesomeIcon icon={faTag} className="icon" />
									{isSideNavOpen && <h3>{tag.name}</h3>}
								</div>
								{isSideNavOpen && (
									<div>
										<button
											style={{ display: tempId == tag.id ? 'flex' : '' }}
											className="ellipsis-btn"
											onClick={(e) => {
												e.stopPropagation();
												if (tempId !== tag.id) {
													setTempId(tag.id);
												} else {
													setTempId(null);
												}
											}}
										>
											<FontAwesomeIcon icon={faEllipsis} className="icon" />
										</button>
										{tempId === tag.id && (
											<div className="tag-actions">
												<button
													style={{ display: 'flex' }}
													className="edit-sidenav-btn"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedTag(tag);
														setWantToEditTag(true);
													}}
												>
													Edit
												</button>
												<button
													style={{ display: 'flex' }}
													className="delete-sidenav-btn"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedTag(tag);
														setWantToDeleteTag(true);
													}}
												>
													Delete
												</button>
											</div>
										)}
									</div>
								)}
							</li>
						))}
					</ul>
				)}
			</ul>
		</div>
	);
};

export default SideNav;
