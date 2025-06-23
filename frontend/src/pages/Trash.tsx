import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { type UserNote } from 'types/index.ts';
import CardSkeleton from '../components/card-skeleton.tsx';
import NoteCard from '../components/note-card.tsx';
import useFetchNotes from '../hooks/use-fetch-notes.ts';
import { useSideNav } from '../hooks/use-side-nav.tsx';
import noTrashedNotes from './../../assets/No_trashed_notes.png';
import ErrorFallback from './error.tsx';

const Trash = () => {
	const { isSideNavOpen } = useSideNav();

	const trashed = useFetchNotes('trashed', 'is_trashed=True');

	if (trashed.length == 0) {
		return (
			<>
				<img
					src={noTrashedNotes}
					style={{ width: '100%', height: 'auto' }}
					className="no-notes"
					alt="No tagged notes"
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
					{trashed &&
						trashed.map((note: UserNote) => (
							<Suspense key={note.id} fallback={<CardSkeleton cards={6} />}>
								<div key={note.id} className="note-div">
									<NoteCard note={note} route={'/trash'} />
								</div>
							</Suspense>
						))}
				</div>
			</div>
		</ErrorBoundary>
	);
};
export default Trash;
