import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { noteQueryOptions } from '../hooks/use-note.ts';
import { cn } from '../lib/utils';
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
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const selectedId = useStore((s) => s.selectedNoteId);
	const setSelectedNoteId = useStore((s) => s.setSelectedNoteId);
	const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const isActive = selectedId === userNote.id;
	const title = getTitleFromHtml(userNote.note.content);

	const content = getContentPreview(userNote.note.content);
	const updatedLabel = userNote.updated_at
		? formatDistanceToNow(new Date(userNote.updated_at), {
				addSuffix: true,
			})
		: 'just now';

	const startPrefetch = () => {
		hoverTimer.current = setTimeout(() => {
			queryClient.prefetchQuery(noteQueryOptions(userNote?.id));
		}, 200);
	};

	const cancelPrefetch = () => {
		if (hoverTimer.current) {
			clearTimeout(hoverTimer.current);
			hoverTimer.current = null;
		}
	};

	const handleSelectNote = async () => {
		cancelPrefetch();
		await queryClient.ensureQueryData(noteQueryOptions(userNote.id));
		setSelectedNoteId(userNote.id);
		navigate(`/notes/${userNote.id}`);
	};

	return (
		<Card
			onMouseEnter={startPrefetch}
			onMouseLeave={cancelPrefetch}
			onFocus={startPrefetch}
			onBlur={cancelPrefetch}
			onClick={handleSelectNote}
			className={cn(
				'gap-2 rounded-none border-x-0 border-t-0 py-3',
				isActive && 'border-ring'
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between py-0">
				<CardTitle className="text-base font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent className="text-muted-foreground line-clamp-3 text-sm">
				{content || 'No Content'}
			</CardContent>
			<CardFooter
				data-testid="footer"
				className="text-muted-foreground text-xs"
			>
				Updated {updatedLabel}
			</CardFooter>
		</Card>
	);
};

function getContentPreview(html: string, maxLength = 119): string {
	const preview = html
		.replace(/<h1[^>]*>.*?<\/h1>/i, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (!preview) return 'No content';

	if (preview.length <= maxLength) return preview;

	// Cut at last space to avoid breaking words
	const truncated = preview.slice(0, maxLength).trimEnd();
	const lastSpace = truncated.lastIndexOf(' ');

	return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

const getTitleFromHtml = (html: string, maxLength = 50): string => {
	const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
	const title = match ? match[1].replace(/<[^>]*>/g, '').trim() : '';

	if (!title) return 'Untitled';

	if (title.length <= maxLength) return title;

	const truncated = title.slice(0, maxLength).trimEnd();
	const lastSpace = truncated.lastIndexOf(' ');

	return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
};

export default NoteCard;
