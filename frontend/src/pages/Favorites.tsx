import { Suspense } from 'react';
import { UserNote, UserNoteData } from 'types/index.ts';
import NoteCard from '../components/NoteCard.tsx';
import useNote from '../hooks/useNote.tsx';
import { useSideNav } from '../hooks/useSideNav.tsx';
import noFavoriteNotes from './../../assets/No_favorited_notes.png';
import Loading from './Loading.tsx';

const Favorite = () => {
	const { isSideNavOpen } = useSideNav();

	const { favorites, isError } = useNote();

	if (favorites.length < 1) {
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

	if (isError) {
		return <div>Error: {isError.message}</div>;
	}
	return (
		<Suspense fallback={<Loading />}>
			<div className="container">
				<div className="all-notes" style={{ maxWidth: isSideNavOpen ? '1200px' : '1400px' }}>
					{favorites &&
						favorites.map((note: UserNote | UserNoteData) => (
							<div key={note.id} className="note-div">
								<NoteCard note={note} route={'/favorite'} />
							</div>
						))}
				</div>
			</div>
		</Suspense>
	);
};

export default Favorite;
