import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import useTag from '../hooks/useTag';
import '../styles/EditTagPopup.css';

const EditTagPopup = () => {
	const [TagName, setTagName] = useState('');

	const { editTag, selectedTag, setWantToEditTag } = useTag();
	const editInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (selectedTag) {
			setTagName(selectedTag.name);

			if (editInputRef.current) {
				editInputRef.current.focus();
			}
		}
	}, [selectedTag]);

	const handleClose = () => setWantToEditTag(false);

	const handleTagNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTagName(e.target.value);
	};

	const handleEditTagName = () => {
		if (TagName.trim() !== '') {
			const updatedTag = { ...selectedTag, name: TagName };
			editTag(updatedTag);
			setTagName('');
		}
		handleClose();
	};

	return (
		<div className="edit-tag-popup-bg" onClick={handleClose}>
			<div
				className="edit-tag-popup-container"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="edit-tag-header">
					<h1 className="edit-tag-title">Edit Tag</h1>
					<button onClick={handleClose} className="close-btn">
						<FontAwesomeIcon icon={faXmark} className="close-icon" />
					</button>
				</div>

				<input
					ref={editInputRef}
					className="edit-tag-input"
					placeholder="Eg. School or Work"
					value={TagName}
					onChange={(e) => {
						handleTagNameChange(e);
					}}
				/>

				<div className="edit-tag-actions">
					<button onClick={handleClose} className="cancel-btn">
						Cancel
					</button>
					<button onClick={handleEditTagName} className="edit-btn">
						Edit
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditTagPopup;
