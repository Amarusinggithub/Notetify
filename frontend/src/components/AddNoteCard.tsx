import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CreateNote } from 'types';
import useMutateNote from '../hooks/useMutateNote';
import '../styles/AddNoteCard.css';
import NoteContentEditor from './Editor/components/NoteContentEditor';

const AddNoteCard = () => {
	const { addNote } = useMutateNote();
	const cardRef = useRef<HTMLDivElement>(null);

	const [noteState, setNoteState] = useState<CreateNote>({
		note_data: {
			title: '',
			content: '',
			users: [],
		},
		is_archived: false,
		is_favorited: false,
		is_pinned: false,
		is_trashed: false,
		tags: [],
	});

	const [isEdited, setIsEdited] = useState(false);
	const [isSelected, setSelected] = useState(false);

	const handleSave = useCallback(async () => {
		if (isEdited) {
			await addNote({ ...noteState });
		}
		setIsEdited(false);
	}, [addNote, isEdited, noteState]);

	const handleSelect = useCallback(
		async (
			e:
				| React.MouseEvent<HTMLButtonElement, MouseEvent>
				| React.MouseEvent<HTMLDivElement, MouseEvent>,
		) => {
			e.preventDefault();
			if (isSelected) {
				if (isEdited) {
					await handleSave();
				}

				setSelected(false);
			} else {
				setNoteState({
					note_data: {
						title: '',
						content: '',
						users: [],
					},
					is_archived: false,
					is_favorited: false,
					is_pinned: false,
					is_trashed: false,
					tags: [],
				});
				setSelected(true);
			}
		},
		[handleSave, isEdited, isSelected],
	);

	useEffect(() => {
		function onDocClick(e: MouseEvent) {
			if (
				isSelected &&
				cardRef.current &&
				!cardRef.current.contains(e.target as Node)
			) {
				handleSelect(e as any);
			}
		}
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	}, [isSelected, handleSelect]);

	useEffect(() => {
		setIsEdited(false);
		console.log(isSelected);
	}, [isSelected]);

	const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTitle = e.target.value;
		setNoteState((prev) => ({
			...prev,
			note_data: { ...prev.note_data, title: newTitle },
		}));
		setIsEdited(newTitle !== null && newTitle !== '');
	};

	const handleContentInput = (newContent: string) => {
		setNoteState((prev) => ({
			...prev,
			note_data: { ...prev.note_data, content: newContent },
		}));
		setIsEdited(newContent !== null && newContent !== '');
	};

	return (
		<div className={isSelected ? 'notecard-bg' : ''}>
			<div
				ref={cardRef}
				className={`add-note-card ${isSelected ? 'selected-note' : ''}`}
				onClick={(e) => {
					if (!isSelected) {
						handleSelect(e);
					}
				}}
			>
				<div className="note">
					<input
						className="note-title"
						placeholder={isSelected ? 'Enter title here' : 'Add note here'}
						onChange={handleTitle}
						value={noteState.note_data.title}
						disabled={!isSelected}
					/>

					{isSelected && (
						<NoteContentEditor
							content={noteState.note_data.content}
							handleContentInput={handleContentInput}
							isSelected={isSelected}
							note={{ ...noteState }}
						/>
					)}
				</div>
				{isSelected && <div className="function-bar"></div>}
			</div>
		</div>
	);
};

export default AddNoteCard;
