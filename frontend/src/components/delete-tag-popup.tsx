import useMutateTag from '../hooks/use-mutate-tag';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog'; 
import { Button } from './ui/button';
import { LightbulbIcon } from 'lucide-react';

const DeleteTagPopup = () => {
	const { removeTag, selectedTag, setWantToDeleteTag } = useMutateTag();

	const handleClose = () => setWantToDeleteTag(false);

	const handleDeleteTag = () => {
		removeTag(selectedTag!);
		handleClose();
	};

	return (
		<Dialog >
			<DialogHeader>
									<DialogTitle >Delete Tag</DialogTitle>

			</DialogHeader>
		
					

				<DialogContent>
					<LightbulbIcon />

					<DialogDescription >
						
							Deleting this tag will permanently remove it from all associated
							notes. The notes themselves will remain, but they will no longer
							be linked to this tag.
					</DialogDescription>
				</DialogContent>

				<DialogFooter >
					<DialogClose asChild>
						<Button variant={"outline"} onClick={handleClose} >
						Cancel
					</Button>
					</DialogClose>
					
					<Button variant={"destructive"} size={"sm"} onClick={handleDeleteTag}>
						Delete
					</Button>
				</DialogFooter>
		</Dialog>
	);
};

export default DeleteTagPopup;
