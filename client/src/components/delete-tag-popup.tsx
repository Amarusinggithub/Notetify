import { LightbulbIcon } from 'lucide-react';
import useMutateTag from '../hooks/use-mutate-tag';
import { Button } from './ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

const DeleteTagPopup = () => {
	const { removeTag, selectedTag, setWantToDeleteTag } = useMutateTag();

	const handleClose = () => setWantToDeleteTag(false);

	const handleDeleteTag = () => {
		removeTag(selectedTag!);
		handleClose();
	};

	return (
		<Dialog>
			<DialogHeader>
				<DialogTitle>Delete Tag</DialogTitle>
			</DialogHeader>

			<DialogContent>
				<LightbulbIcon />

				<DialogDescription>
					Deleting this tag will permanently remove it from all associated
					notes. The notes themselves will remain, but they will no longer be
					linked to this tag.
				</DialogDescription>
			</DialogContent>

			<DialogFooter>
				<DialogClose asChild>
					<Button variant={'outline'} onClick={handleClose}>
						Cancel
					</Button>
				</DialogClose>

				<Button variant={'destructive'} size={'sm'} onClick={handleDeleteTag}>
					Delete
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default DeleteTagPopup;
