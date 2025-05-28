import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { CreateNote, Note } from 'types/index.ts';
import NoteCard from '../components/NoteCard.tsx';
import useNote from '../hooks/useNote.tsx';
import { useSideNav } from '../hooks/useSideNav.tsx';
import noFavoriteNotes from './../../assets/No_favorited_notes.png';
import ErrorFallback from './Error.tsx';
import Loading from './Loading.tsx';

const Favorite = () => {
	const { isSideNavOpen } = useSideNav();

	const { favorites, data } = useNote();

	if (data!.length! > 0 && favorites.length == 0) {
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
			<Suspense fallback={<Loading />}>
				<div className="container">
					<div className="all-notes" style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}>
						{favorites &&
							favorites.map((note: Note | CreateNote) => (
								<div key={note.id} className="note-div">
									<NoteCard note={note} route={'/favorite'} />
								</div>
							))}
					</div>
				</div>
			</Suspense>
		</ErrorBoundary>
	);
};

export default Favorite;
