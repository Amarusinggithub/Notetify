import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import noFavoriteNotes from '../assets/No_favorite_notes.png';
import CardSkeleton from '../components/card-skeleton.tsx';
import NoteCard from '../components/note-card.tsx';
import useFetchNotes from '../hooks/use-fetch-notes.ts';
import { useSideNav } from '../hooks/use-side-nav.tsx';
import { type UserNote } from '../types/index.ts';
import ErrorFallback from './error.tsx';

const Favorite = () => {
	const { isSideNavOpen } = useSideNav();

	const favorites = useFetchNotes(
		'favorites',
		'is_favorite=True&is_trashed=False&is_archived=False',
	);

	if (favorites.length == 0) {
		return (
			<div>
				<img
					src={noFavoriteNotes}
					style={{ width: '100%', height: 'auto' }}
					className="no-notes"
					alt="No favorite notes"
				/>
			</div>
		);
	}

	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div className="container">
				<div
					className="all-notes"
					style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}
				>
					{favorites &&
						favorites.map((note: UserNote) => (
							<Suspense key={note.id} fallback={<CardSkeleton cards={6} />}>
								<div key={note.id} className="note-div">
									<NoteCard note={note} route={'/favorite'} />
								</div>{' '}
							</Suspense>
						))}
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default Favorite;
