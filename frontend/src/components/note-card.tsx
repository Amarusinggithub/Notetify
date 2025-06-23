import {
	faStar,
	faThumbTack,
	faTrashCan,
	faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {
	useCallback,
	useEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import { useNavigate } from 'react-router';
import { UserNote } from 'types/index.ts';
import useMutateNote from '../hooks/use-mutate-note.tsx';
import '../styles/NoteCard.css';
import { isUserNote, userNoteReducer } from './../utils/helpers.ts';
import NoteContentEditor from './Editor/components/note-content-editor.tsx';

type NoteCardProps = { note: UserNote; route: string };

const NoteCard = ({ note, route }: NoteCardProps) => {
	const cardRef = useRef<HTMLDivElement>(null);

	const [noteState, dispatch] = useReducer(userNoteReducer, note);
	const navigate = useNavigate();
	const {
		selectedNote,
		setSelectedNote,
		editNote,
		removeNote,
		handleFavorite,
		handlePin,
	} = useMutateNote();

	const isSelected = selectedNote && selectedNote.id === note.id;

	const [isEdited, setIsEdited] = useState<boolean>(false);

	const handleSave = async () => {
		if (isEdited) {
			await editNote({ ...noteState });
		}
		setIsEdited(false);
	};

	const handleSelect = async (
		e:
			| React.MouseEvent<HTMLButtonElement, MouseEvent>
			| React.MouseEvent<HTMLDivElement, MouseEvent>,
	) => {
		e.preventDefault();
		await handleSave();
		setSelectedNote(isSelected ? null : note);
		if (isSelected && route !== '') navigate(route);
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
	}, [note]);

	const handleTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.stopPropagation();
		const newTitle = e.target.value;
		dispatch({ type: 'SET_TITLE', payload: newTitle });
		setIsEdited(newTitle !== note.note?.title);
	};

	const handleContentInput = useCallback(
		(newContent: string) => {
			dispatch({ type: 'SET_CONTENT', payload: newContent });
			setIsEdited(newContent !== note.note?.content);
		},
		[note],
	);

	const handleDeleteNote = async (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) => {
		e.preventDefault();
		e.stopPropagation();
		if (isUserNote(note)) await removeNote(note);
	};

	return (
		<div className={isSelected ? 'notecard-bg' : ''}>
			<div
				ref={cardRef}
				className={`note-card ${isSelected ? 'selected-note' : ''}`}
				onClick={(e) => {
					if (!isSelected) {
						handleSelect(e);
					}
				}}
			>
				<div className="note">
					<div
						className="top-function-header"
						style={{
							justifyContent: isSelected ? 'space-between' : 'flex-end',
						}}
					>
						{isSelected && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleSelect(e);
								}}
								className="note-close-btn"
							>
								<FontAwesomeIcon icon={faXmark} className="note-close-icon" />
							</button>
						)}

						{noteState.is_trashed && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleDeleteNote(e);
								}}
								className="delete-note-btn"
							>
								<FontAwesomeIcon
									icon={faTrashCan}
									className="note-trash-icon"
								/>
							</button>
						)}

						{noteState.is_archived == false &&
							noteState.is_trashed == false && (
								<div className="pin-favorite-actions">
									<button
										onClick={(e) => {
											e.stopPropagation();
											handlePin(note);
										}}
										className="note-pin-btn"
									>
										<FontAwesomeIcon icon={faThumbTack} className="pin-icon" />
									</button>

									<button
										onClick={(e) => {
											e.stopPropagation();
											handleFavorite(note);
										}}
										className="note-favorite-btn"
									>
										<FontAwesomeIcon icon={faStar} className="favorite-icon" />
									</button>
								</div>
							)}
					</div>

					<input
						className="note-title"
						onChange={(e) => {
							isSelected ? handleTitleInput(e) : null;
						}}
						value={noteState.note?.title}
						disabled={!isSelected}
					/>

					<NoteContentEditor
						content={noteState.note?.content}
						handleContentInput={handleContentInput}
						isSelected={isSelected!}
						note={noteState}
					/>
				</div>

				{isSelected && <div className="function-bar"></div>}
			</div>
		</div>
	);
};

export default NoteCard;
