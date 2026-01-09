import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import React, { useEffect, useRef, useState } from 'react';
import useMutateTag from '../hooks/use-tag';
import { Button } from './ui/button';
import { DialogClose, DialogFooter, DialogHeader } from './ui/dialog';
import { Input } from './ui/input';

const EditTagPopup = () => {
	const [TagName, setTagName] = useState('');

	const { editTag, selectedTag, setWantToEditTag } = useMutateTag();
	const editInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (selectedTag) {
			setTagName(selectedTag.tag.name);

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
		if (TagName.trim() === '') return;

		const updatedTag = {
			...selectedTag!.tag,
			name: TagName.trim(),
		};

		const updatedUserTag = {
			...selectedTag!,
			tag: updatedTag,
		};

		editTag(updatedUserTag);
		setTagName('');
		handleClose();
	};

	return (
		<Dialog>
			<DialogHeader>
				<DialogTitle>Edit Tag</DialogTitle>
			</DialogHeader>
			<DialogContent>
				<Input
					ref={editInputRef}
					className="edit-tag-input"
					placeholder="Eg. School or Work"
					value={TagName}
					onChange={(e) => {
						handleTagNameChange(e);
					}}
				/>
			</DialogContent>

			<DialogFooter>
				<DialogClose asChild>
					<Button onClick={handleClose} size={'sm'}>
						Cancel
					</Button>
				</DialogClose>

				<Button onClick={handleEditTagName} size={'sm'}>
					Edit
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default EditTagPopup;
