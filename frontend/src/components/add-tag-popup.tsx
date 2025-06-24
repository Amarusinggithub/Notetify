import { faLightbulb, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { type CreateTag } from '../types';
import useMutateTag from '../hooks/use-mutate-tag';
import { useSideNav } from '../hooks/use-side-nav';
import '../styles/AddTagPopUp.css';

const AddTagPopup = () => {
	const [newTag, setNewTag] = useState<CreateTag>({
		tag_data: {
			name: '',
		},
	});

	const { setAddTagPopupOpen } = useSideNav();
	const { makeTag } = useMutateTag();

	const addInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (addInputRef.current) {
			addInputRef.current.focus();
		}
	}, []);

	const handleClose = () => setAddTagPopupOpen(false);

	const handleTagNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value;
		setNewTag((prev) => ({
			...prev,
			tag_data: {
				...prev.tag_data,
				name: name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
			},
		}));
	};

	const handleAddTagName = () => {
		if (newTag.tag_data.name.trim() !== '') {
			makeTag(newTag);
			setNewTag({
				tag_data: {
					name: '',
				},
			});
		}
		handleClose();
	};

	return (
		<div className="add-tag-popup-bg" onClick={handleClose}>
			<div
				className="add-tag-popup-container"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="add-tag-header">
					<h1 className="add-tag-title">Create Tag</h1>
					<button onClick={handleClose} className="close-btn">
						<FontAwesomeIcon icon={faXmark} className="close-icon" />
					</button>
				</div>

				<input
					ref={addInputRef}
					className="add-tag-input"
					placeholder="Eg. School or Work"
					value={newTag.tag_data.name}
					onChange={(e) => {
						handleTagNameChange(e);
					}}
				/>

				<div className="tag-info-container">
					<FontAwesomeIcon icon={faLightbulb} className="info-icon" />

					<div className="tag-info-text">
						<h3 className="tag-info-title">What is a Tag?</h3>
						<p className="tag-info-description">
							Tags help you categorize and quickly find your notes by linking
							related content under a common label.
						</p>
					</div>
				</div>

				<div className="add-tag-actions">
					<button onClick={handleClose} className="cancel-btn">
						Cancel
					</button>
					<button onClick={handleAddTagName} className="create-btn">
						Create
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddTagPopup;
