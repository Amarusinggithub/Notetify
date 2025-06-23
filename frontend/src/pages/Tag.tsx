import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { UserNote } from 'types/index.ts';
import NoteCard from '../components/NoteCard.tsx';
import useFetchNotes from '../hooks/use-fetch-notes.ts';
import { useSideNav } from '../hooks/use-side-nav.tsx';
import noTaggedNotes from './../../assets/No_tagged_Notes.png';
import ErrorFallback from './Error.tsx';
import CardSkeleton from '../components/CardSkeleton';

const Tag = () => {
	const { isSideNavOpen } = useSideNav();
	const { temp } = useSideNav();

	const params = `tags__id=${temp.id}&is_archived=False&is_trashed=False`;
	const tagNotes = useFetchNotes('tag-notes', params);

	if (tagNotes.length == 0) {
		return (
			<>
				<img
					src={noTaggedNotes}
					style={{ width: '100%', height: 'auto' }}
					className="no-notes"
					alt="No Tagged notes"
				/>
			</>
		);
	}

	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div className="container">
				<div
					className="all-notes"
					style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}
				>
					{tagNotes?.map((note: UserNote) => (
						<Suspense key={note.id} fallback={<CardSkeleton cards={6} />}>
							<div key={note.id} className="note-div">
								<NoteCard note={note} route={'/tag'} />
							</div>
						</Suspense>
					))}
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default Tag;
