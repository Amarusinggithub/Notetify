import React, {
	useCallback,
	useEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import { createNoteReducer, initialNoteState } from '../utils/helpers';
import useMutateNote from '../hooks/useMutateNote';
import '../styles/AddNoteCard.css';
import NoteContentEditor from './Editor/components/NoteContentEditor';

const AddNoteCard = () => {
	const [note, dispatch] = useReducer(createNoteReducer, initialNoteState);

	const { addNote } = useMutateNote();
	const cardRef = useRef<HTMLDivElement>(null);

	const [isEdited, setIsEdited] = useState(false);
	const [isSelected, setSelected] = useState(false);

	const handleSave = async () => {
		if (isEdited) {
			await addNote(note);
		}
		setIsEdited(false);
		setSelected(false);
	};

	const handleSelect = async (
		e:
			| React.MouseEvent<HTMLButtonElement, MouseEvent>
			| React.MouseEvent<HTMLDivElement, MouseEvent>,
	) => {
		e.preventDefault();
		if (isSelected) {
			await handleSave();
		} else {
			dispatch({ type: 'RESET' });
			setSelected(true);
		}
	};

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
	}, [isSelected]);

	const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTitle = e.target.value;
		dispatch({ type: 'SET_TITLE', payload: newTitle });
		setIsEdited(newTitle !== null && newTitle !== '');
	};

	const handleContentInput = useCallback(
		(newContent: string) => {
			dispatch({ type: 'SET_CONTENT', payload: newContent });

			setIsEdited(newContent !== null && newContent !== '');
		},
		[isEdited],
	);

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
						value={note.note_data.title}
						disabled={!isSelected}
					/>

					{isSelected && (
						<NoteContentEditor
							content={note.note_data.content}
							handleContentInput={handleContentInput}
							isSelected={isSelected}
							note={{ ...note }}
						/>
					)}
				</div>
				{isSelected && <div className="function-bar"></div>}
			</div>
		</div>
	);
};

export default AddNoteCard;
