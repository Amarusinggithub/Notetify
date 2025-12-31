import { formatDistanceToNow } from 'date-fns';
import { Star } from 'lucide-react';
import { useStore } from '../stores/index.ts';
import type { UserNote } from '../types';
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
	const selectedId = useStore((s) => s.selectedNoteId);
	const setSelected = useStore((s) => s.setSelectedNote);

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
				{userNote.is_favorite && (
					<Star
						data-testid="favorite-indicator"
						className="size-4 text-yellow-400"
						fill="currentColor"
					/>
				)}
			</CardHeader>
			<CardContent className="text-muted-foreground line-clamp-3 text-sm">
				{preview || 'No content yet.'}
			</CardContent>
			<CardFooter className="text-muted-foreground text-xs">
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
