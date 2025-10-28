import type { UserNote } from 'types';
import { useNotesStore } from '../stores/use-notes-store';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';

type NoteCardProp = {
	userNote: UserNote;
};

const NoteCard = ({ userNote }: NoteCardProp) => {
	const selectedId = useNotesStore((s) => s.selectedNoteId);
	const setSelected = useNotesStore((s) => s.setSelectedNote);

	const isActive = selectedId === userNote.id;

	return (
		<Card
			onClick={() => setSelected(userNote.id)}
			className={isActive ? 'border-ring' : undefined}
		>
			<CardHeader>
				<CardTitle>{userNote.note.title}</CardTitle>
			</CardHeader>
			<CardContent></CardContent>
			<CardFooter></CardFooter>
		</Card>
	);
};

export default NoteCard;
