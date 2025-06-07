import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/NoteCard.css';

import {
	faStar,
	faThumbTack,
	faTrashCan,
	faXmark,
} from '@fortawesome/free-solid-svg-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { CreateNote, UserNote } from 'types/index.ts';
import useMutateNote from '../hooks/useMutateNote.tsx';
import { isUserNote } from './../utils/helpers.ts';
import NoteContentEditor from './Editor/components/NoteContentEditor.tsx';

type NoteCardProps = { note: UserNote; route: string };

const NoteCard = ({ note, route }: NoteCardProps) => {
	const navigate = useNavigate();
	const cardRef = useRef<HTMLDivElement>(null);

	const {
		selectedNote,
		setSelectedNote,
		editNote,
		removeNote,
		handleFavorite,
		handlePin,
	} = useMutateNote();
	const [noteState, setNoteState] = useState<UserNote | CreateNote>(note);

	const isSelected = selectedNote && selectedNote.id === note.id;

	const [isEdited, setIsEdited] = useState<boolean>(false);

	const handleSave = useCallback(async () => {
		if (isEdited) {
			if (isUserNote(noteState)) await editNote(noteState);
		}
		setIsEdited(false);
	}, [editNote, isEdited, noteState]);

	const handleSelect = useCallback(
		async (
			e:
				| React.MouseEvent<HTMLButtonElement, MouseEvent>
				| React.MouseEvent<HTMLDivElement, MouseEvent>,
		) => {
			e.preventDefault();
			await handleSave();
			if (isUserNote(note)) setSelectedNote(isSelected ? null : note);
			if (isSelected && route !== '') navigate(route);
		},
		[handleSave, isSelected, navigate, note, route, setSelectedNote],
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
		setNoteState(note);
		setIsEdited(false);
	}, [note]);

	const handleTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.stopPropagation();
		const newTitle = e.target.value;
		setNoteState((prev) => {
			if (isUserNote(prev)) {
				return {
					...prev,
					note: {
						...prev.note,
						title: newTitle,
					},
				};
			} else {
				return {
					...prev,
					note_data: {
						...prev.note_data,
						title: newTitle,
					},
				};
			}
		});
		setIsEdited(
			isUserNote(noteState)
				? newTitle !== noteState.note?.title
				: newTitle !== noteState.note_data?.title,
		);
	};

	const handleContentInput = (newContent: string) => {
		setNoteState((prev) => {
			if (isUserNote(prev)) {
				return {
					...prev,
					note: {
						...prev.note,
						content: newContent,
					},
				};
			} else {
				return {
					...prev,
					note_data: {
						...prev.note_data,
						content: newContent,
					},
				};
			}
		});
		setIsEdited(
			isUserNote(noteState)
				? newContent !== noteState.note?.content
				: newContent !== noteState.note_data?.content,
		);
	};

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
											if (isUserNote(note)) handlePin(note);
										}}
										className="note-pin-btn"
									>
										<FontAwesomeIcon icon={faThumbTack} className="pin-icon" />
									</button>

									<button
										onClick={(e) => {
											e.stopPropagation();
											if (isUserNote(note)) handleFavorite(note);
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
						value={
							isUserNote(noteState)
								? noteState.note?.title
								: noteState.note_data?.title
						}
						disabled={!isSelected}
					/>

					<NoteContentEditor
						content={
							isUserNote(noteState)
								? noteState.note?.content
								: noteState.note_data?.content
						}
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
