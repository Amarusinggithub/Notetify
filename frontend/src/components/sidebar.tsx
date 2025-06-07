import { faEllipsis, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Tag } from 'types/index.ts';
import useFetchTags from '../hooks/useFetchTags.ts';
import useMutateTag from '../hooks/useMutateTag.tsx';
import useSearchState from '../hooks/useSearchState.tsx';
import { useSideNav } from '../hooks/useSideNav.tsx';
import '../styles/sidebar.css';

const SideNav = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isSideNavOpen, setAddTagPopupOpen, sidebarMenuItems, temp, setTemp } =
		useSideNav();
	const { setParams } = useSearchState();

	const { setWantToDeleteTag, setSelectedTag, setWantToEditTag } =
		useMutateTag();
	const tags = useFetchTags();

	const [tempId, setTempId] = useState<any>(null);

	let path = location.pathname;

	useEffect(() => {
		for (let i = 0; i < sidebarMenuItems.length; i++) {
			if (path === sidebarMenuItems[i].href) {
				setTemp(sidebarMenuItems[i]);
				navigate(sidebarMenuItems[i].href);
				setParams(sidebarMenuItems[i].params);
			}
		}

		for (let j = 0; j < tags.length; j++) {
			if (path === '/tag/' + tags[j].name) {
				setTemp(tags[j]);
				setParams(
					`tags__name=${tags[j].name}&is_archived=False&is_trashed=False`,
				);
			}
		}
	}, [tags]);

	const handleOnClick = (index: number) => {
		return () => {
			setTemp(sidebarMenuItems[index]);
			navigate(sidebarMenuItems[index].href);
			setParams(sidebarMenuItems[index].params);
		};
	};

	const handleTagClicked = (tag: Tag) => {
		setTemp(tag);
		navigate('/tag/' + tag.name);
		setParams(tag.name);
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
							backgroundColor:
								sidebarMenuItems[index] === temp ? ' rgb(65, 51, 28)' : '',
						}}
						className="sidenav-item"
					>
						<div className="icon-and-name">
							<FontAwesomeIcon icon={item.icon!} className="icon" />
							{isSideNavOpen && <h3>{item.name}</h3>}
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
					}}
					className="sidenav-item-add-tag"
				>
					<div className="icon-and-name">
						<FontAwesomeIcon icon={faPlus} className="icon" />
						{isSideNavOpen && <h3>{'Add Tag'}</h3>}
					</div>
				</li>
				{isSideNavOpen && tags?.length > 0 && (
					<h3 className="title-tags">Tags</h3>
				)}
				{tags?.length > 0 && (
					<ul className="tags">
						{tags.map((tag: Tag, index: number) => (
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
									backgroundColor: tag === temp ? ' rgb(65, 51, 28)' : '',
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
