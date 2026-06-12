import { formatDistanceToNow } from 'date-fns';
import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/shared/lib/utils';
import { useStore } from '@/app/store/index.ts';
import type { UserNote } from '@/shared/types';

import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from '@/shared/components/ui/card';
import type { JSONContent } from '@tiptap/react';
import { prefetchNote } from '../hooks/prefetch-note';
import { prefetchCollabSession } from '@/features/editor/hooks/prefetch-collab-session';

type NoteCardProp = {
	userNote: UserNote;
};

const NoteCard = ({ userNote }: NoteCardProp) => {
	const navigate = useNavigate();
	const isActive = useStore((s) => s.selectedNoteId === userNote.id);
	const setSelectedNoteId = useStore((s) => s.setSelectedNoteId);
	const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const title = getTitlePreview(userNote.note?.content ?? null);
	const content = getContentPreview(userNote.note?.content ?? null);
	const updatedLabel = userNote.updated_at
		? formatDistanceToNow(new Date(userNote.updated_at), {
				addSuffix: true,
			})
		: 'just now';

	const startPrefetch = () => {
		hoverTimer.current = setTimeout(() => {
			prefetchNote(userNote.id);
			prefetchCollabSession(userNote.id);
		}, 150);
	};

	const cancelPrefetch = () => {
		if (hoverTimer.current) {
			clearTimeout(hoverTimer.current);
			hoverTimer.current = null;
		}
	};

	const handleSelectNote = () => {
		cancelPrefetch();
		setSelectedNoteId(userNote.id);
		void navigate(`/notes/${userNote.id}`);
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
				isActive && 'bg-accent'
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between py-0">
				<CardTitle className="text-base font-semibold">
					{title || 'No Title'}
				</CardTitle>
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

const extractText = (node: JSONContent): string => {
	if (node.type === 'text') return node.text ?? '';
	return (node.content ?? []).map(extractText).join('');
};

const truncate = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	const cut = text.slice(0, maxLength).trimEnd();
	const lastSpace = cut.lastIndexOf(' ');
	return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '...';
};

function getTitlePreview(content: JSONContent | null, maxLength = 50): string {
	const h1 = content?.content?.find(
		(n: JSONContent) => n.type === 'heading' && n.attrs?.level === 1
	);
	const title = h1 ? extractText(h1).trim() : '';
	return title ? truncate(title, maxLength) : 'Untitled';
}

function getContentPreview(
	content: JSONContent | null,
	maxLength = 119
): string {
	const bodyNodes = (content?.content ?? []).filter(
		(n: JSONContent) => !(n.type === 'heading' && n.attrs?.level === 1)
	);
	const preview = bodyNodes
		.map(extractText)
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
	return preview ? truncate(preview, maxLength) : 'No content';
}

export default NoteCard;
