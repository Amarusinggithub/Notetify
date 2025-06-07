import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { UserNote } from 'types/index.ts';
import NoteCard from '../components/NoteCard.tsx';
import useFetchNotes from '../hooks/useFetchNotes.ts';
import { useSideNav } from '../hooks/useSideNav.tsx';
import noFavoriteNotes from './../../assets/No_favorited_notes.png';
import ErrorFallback from './Error.tsx';
import CardSkeleton from '../components/CardSkeleton';


const Favorite = () => {
	const { isSideNavOpen } = useSideNav();

	const favorites = useFetchNotes(
		'favorites',
		'is_favorited=True&is_trashed=False&is_archived=False',
	);

	if (favorites.length == 0) {
		return (
			<div>
				<img
					src={noFavoriteNotes}
					style={{ width: '100%', height: 'auto' }}
					className="no-notes"
					alt="No favorited notes"
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
							<Suspense key={note.id} fallback={<CardSkeleton />}>
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
