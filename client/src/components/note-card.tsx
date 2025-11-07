import type { UserNote } from '../types';
import { useNotesStore } from '../stores/use-notes-store';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Star } from 'lucide-react';

type NoteCardProp = {
	userNote: UserNote;
};

const NoteCard = ({ userNote }: NoteCardProp) => {
	const selectedId = useNotesStore((s) => s.selectedNoteId);
	const setSelected = useNotesStore((s) => s.setSelectedNote);

	const isActive = selectedId === userNote.id;
	const preview = getPreview(userNote.note.content ?? '');
	const updatedLabel = userNote.updated_at
		? formatDistanceToNow(new Date(userNote.updated_at), {
				addSuffix: true,
		  })
		: 'just now';

	return (
		<Card
			onClick={() => setSelected(userNote.id)}
			className={isActive ? 'border-ring' : undefined}
		>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-base font-semibold">
					{userNote.note.title || 'Untitled'}
				</CardTitle>
				{userNote.is_favorited && (
					<Star
						data-testid="favorite-indicator"
						className="size-4 text-yellow-400"
						fill="currentColor"
					/>
				)}
			</CardHeader>
			<CardContent className="text-sm text-muted-foreground line-clamp-3">
				{preview || 'No content yet.'}
			</CardContent>
			<CardFooter className="text-xs text-muted-foreground">
				Updated {updatedLabel}
			</CardFooter>
		</Card>
	);
};

function getPreview(html: string): string {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export default NoteCard;
